from app.modules.pedidos.models import (
    DetallePedido,
    EstadoPedido,
    Pedido,
    ahora,
)
from app.modules.pedidos.schemas import (
    DetallePedidoRead,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

# RN-02: mapa de transiciones válidas. Los estados terminales no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    EstadoPedido.PENDIENTE.value: {
        EstadoPedido.EN_PREPARACION.value,
        EstadoPedido.CANCELADO.value,
    },
    EstadoPedido.EN_PREPARACION.value: {
        EstadoPedido.ENTREGADO.value,
        EstadoPedido.CANCELADO.value,
    },
    EstadoPedido.ENTREGADO.value: set(),
    EstadoPedido.CANCELADO.value: set(),
}


# ===== Excepciones de dominio =====#
class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"No existe el pedido {pedido_id}")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"No existe el producto {producto_id}")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, stock: int) -> None:
        super().__init__(f"Stock insuficiente de '{nombre}': quedan {stock}")


class ProductoRepetido(Exception):
    def __init__(self) -> None:
        super().__init__("No se puede repetir el mismo producto en dos ítems")


class TransicionInvalida(Exception):
    def __init__(self, desde: str, hacia: str) -> None:
        super().__init__(f"No se puede pasar de {desde} a {hacia}")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ===== RN-01: crear el pedido en una sola transacción =====#
    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            identificadores = [item.producto_id for item in datos.items]
            if len(identificadores) != len(set(identificadores)):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=EstadoPedido.PENDIENTE.value,
                    forma_pago=datos.forma_pago.value,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas,
                    total=0,
                )
            )
            pedido_id = pedido.id
            if pedido_id is None:
                raise RuntimeError("El pedido no obtuvo id después del flush")

            total = 0.0
            lineas: list[DetallePedidoRead] = []

            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock)

                # Se descuenta el stock en la misma transacción
                producto.stock -= item.cantidad
                uow.productos.add(producto)

                # La línea copia el nombre y el precio del producto (RN-05)
                subtotal = producto.precio_base * item.cantidad
                detalle = DetallePedido(
                    pedido_id=pedido_id,
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.session.add(detalle)
                uow.session.flush()

                total += subtotal
                lineas.append(DetallePedidoRead.model_validate(detalle))

            pedido.total = total
            uow.pedidos.add(pedido)

            # La respuesta se arma dentro del with: después del commit los
            # atributos expiran y la sesión se cierra.
            return self._a_schema(pedido, lineas)

    # ===== Listado =====#
    def listar(
        self,
        usuario_id: int | None,
        estado: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> PedidosPaginados:
        with self.uow as uow:
            total, pedidos = uow.pedidos.list_by_usuario(
                usuario_id=usuario_id, estado=estado, skip=skip, limit=limit
            )
            return PedidosPaginados(
                total=total,
                items=[self._a_schema(p, self._lineas(p)) for p in pedidos],
            )

    # ===== Detalle =====#
    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            # RN-04: el cliente solo ve sus propios pedidos
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return self._a_schema(pedido, self._lineas(pedido))

    # ===== RN-02 y RN-03: cambio de estado del admin =====#
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            self._validar_transicion(pedido.estado, nuevo_estado)

            if nuevo_estado == EstadoPedido.CANCELADO.value:
                self._restituir_stock(uow, pedido)

            pedido.estado = nuevo_estado
            pedido.updated_at = ahora()
            uow.pedidos.add(pedido)
            return self._a_schema(pedido, self._lineas(pedido))

    # ===== RN-03 y RN-04: cancelación del dueño =====#
    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)

            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            # El cliente solo cancela desde PENDIENTE
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida(
                    pedido.estado, EstadoPedido.CANCELADO.value
                )

            self._restituir_stock(uow, pedido)
            pedido.estado = EstadoPedido.CANCELADO.value
            pedido.updated_at = ahora()
            uow.pedidos.add(pedido)
            return self._a_schema(pedido, self._lineas(pedido))

    # ===== Resumen del panel =====#
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado(EstadoPedido.PENDIENTE),
                en_preparacion=uow.pedidos.count_by_estado(
                    EstadoPedido.EN_PREPARACION
                ),
                entregados=uow.pedidos.count_by_estado(EstadoPedido.ENTREGADO),
                cancelados=uow.pedidos.count_by_estado(EstadoPedido.CANCELADO),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )

    # ===== Auxiliares =====#
    def _buscar(self, uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    def _validar_transicion(self, desde: str, hacia: str) -> None:
        if hacia not in TRANSICIONES.get(desde, set()):
            raise TransicionInvalida(desde, hacia)

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve el stock de cada línea en la misma transacción."""
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad
                uow.productos.add(producto)

    def _lineas(self, pedido: Pedido) -> list[DetallePedidoRead]:
        return [DetallePedidoRead.model_validate(linea) for linea in pedido.items]

    def _a_schema(
        self, pedido: Pedido, lineas: list[DetallePedidoRead]
    ) -> PedidoRead:
        return PedidoRead(
            id=pedido.id or 0,
            usuario_id=pedido.usuario_id,
            estado=pedido.estado,
            forma_pago=pedido.forma_pago,
            direccion_entrega=pedido.direccion_entrega,
            notas=pedido.notas,
            total=pedido.total,
            created_at=pedido.created_at,
            updated_at=pedido.updated_at,
            items=lineas,
        )