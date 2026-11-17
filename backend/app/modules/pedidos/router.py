from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import AdminDep, UsuarioActivoDep
from app.modules.pedidos.models import EstadoPedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

PedidoId = Annotated[int, Path(gt=0, description="ID del pedido")]


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServicioDep = Annotated[PedidoService, Depends(get_pedido_service)]


# ============ Crear pedido (RN-01) =============#
@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un pedido desde el carrito",
)
def crear_pedido(
    servicio: ServicioDep, datos: PedidoCreate, usuario: UsuarioActivoDep
):
    try:
        # El usuario_id sale de la sesión, nunca del cuerpo de la petición
        return servicio.crear(datos, usuario.id or 0)
    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error
    except (ProductoNoDisponible, StockInsuficiente, ProductoRepetido) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)
        ) from error


# ============ Listar pedidos =============#
@router.get(
    "",
    response_model=PedidosPaginados,
    status_code=status.HTTP_200_OK,
    summary="Los propios (user) o todos (admin)",
)
def listar_pedidos(
    servicio: ServicioDep,
    usuario: UsuarioActivoDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Annotated[Optional[EstadoPedido], Query()] = None,
):
    es_admin = usuario.role == "admin"
    return servicio.listar(
        usuario_id=None if es_admin else usuario.id,
        estado=estado.value if estado else None,
        skip=skip,
        limit=limit,
    )


# ============ Resumen del panel =============#
# Se declara ANTES de /{pedido_id}, si no la ruta dinámica se lo come.
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    status_code=status.HTTP_200_OK,
    summary="Indicadores para el panel de administración",
)
def resumen_pedidos(servicio: ServicioDep, admin: AdminDep):
    return servicio.resumen()


# ============ Detalle =============#
@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
    summary="Detalle del pedido con sus líneas",
)
def obtener_pedido(
    servicio: ServicioDep, pedido_id: PedidoId, usuario: UsuarioActivoDep
):
    try:
        return servicio.obtener(
            pedido_id, usuario.id or 0, usuario.role == "admin"
        )
    except PedidoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error
    except PedidoAjeno as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(error)
        ) from error


# ============ Cambiar estado (RN-02 y RN-03) =============#
@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
    summary="Avanzar o cancelar el pedido según la máquina de estados",
)
def cambiar_estado(
    servicio: ServicioDep,
    pedido_id: PedidoId,
    datos: CambioEstado,
    admin: AdminDep,
):
    try:
        return servicio.cambiar_estado(pedido_id, datos.estado.value)
    except PedidoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error
    except TransicionInvalida as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)
        ) from error


# ============ Cancelar el propio pedido (RN-03 y RN-04) =============#
@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
    summary="Cancelar un pedido propio en estado PENDIENTE",
)
def cancelar_pedido(
    servicio: ServicioDep, pedido_id: PedidoId, usuario: UsuarioActivoDep
):
    try:
        return servicio.cancelar(pedido_id, usuario.id or 0)
    except PedidoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error
    except PedidoAjeno as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(error)
        ) from error
    except TransicionInvalida as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)
        ) from error