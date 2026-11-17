from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


# ===== Excepciones de dominio =====#
class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"No existe el producto {producto_id}")


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"No existe la categoría {categoria_id}")


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            return ProductoRead.model_validate(producto)

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)

            producto = Producto(
                nombre=datos.nombre,
                descripcion=datos.descripcion,
                precio_base=datos.precio_base,
                imagen_url=datos.imagen_url,
                stock=datos.stock,
                disponible=datos.disponible,
                categoria_id=datos.categoria_id,
            )
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)

            if datos.categoria_id is not None:
                self._validar_categoria(uow, datos.categoria_id)
                producto.categoria_id = datos.categoria_id

            # exclude_unset deja afuera los campos que el cliente no envió
            cambios = datos.model_dump(exclude_unset=True, exclude={"categoria_id"})
            for campo, valor in cambios.items():
                if valor is not None:
                    setattr(producto, campo, valor)

            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, datos: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            producto.stock = datos.stock
            producto.disponible = datos.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: activo = False."""
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)

    # ===== Auxiliares =====#
    def _buscar_activo(self, uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(producto_id)
        return producto

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)