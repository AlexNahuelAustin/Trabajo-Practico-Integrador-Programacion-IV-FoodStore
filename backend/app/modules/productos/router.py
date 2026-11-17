from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import solo_admin
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])

ProductoId = Annotated[int, Path(gt=0, description="ID del producto")]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServicioDep = Annotated[ProductoService, Depends(get_producto_service)]


@router.get(
    "",
    response_model=ProductosPaginados,
    status_code=status.HTTP_200_OK,
    summary="Listar productos activos, paginado y con filtros",
)
def listar_productos(
    servicio: ServicioDep,
    skip: Annotated[int, Query(ge=0, description="Registros a omitir")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Máximo por página")] = 20,
    search: Annotated[
        Optional[str], Query(description="Búsqueda parcial por nombre")
    ] = None,
    categoria_id: Annotated[Optional[int], Query(gt=0)] = None,
    disponible: Annotated[Optional[bool], Query()] = None,
):
    return servicio.listar(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    summary="Detalle de un producto con su categoría",
)
def obtener_producto(servicio: ServicioDep, producto_id: ProductoId):
    try:
        return servicio.obtener(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un producto",
    dependencies=[solo_admin],
)
def crear_producto(servicio: ServicioDep, datos: ProductoCreate):
    try:
        return servicio.crear(datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    summary="Actualizar un producto",
    dependencies=[solo_admin],
)
def actualizar_producto(
    servicio: ServicioDep, producto_id: ProductoId, datos: ProductoUpdate
):
    try:
        return servicio.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    summary="Actualizar el stock y la disponibilidad",
    dependencies=[solo_admin],
)
def actualizar_stock(
    servicio: ServicioDep, producto_id: ProductoId, datos: ProductoStockUpdate
):
    try:
        return servicio.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica de un producto",
    dependencies=[solo_admin],
)
def eliminar_producto(servicio: ServicioDep, producto_id: ProductoId) -> None:
    try:
        servicio.eliminar(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error