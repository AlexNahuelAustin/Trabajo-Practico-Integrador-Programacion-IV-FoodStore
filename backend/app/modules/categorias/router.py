from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import solo_admin
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(prefix="/categorias", tags=["categorias"])

CategoriaId = Annotated[int, Path(gt=0, description="ID de la categoría")]


def get_categoria_service() -> CategoriaService:
    """El Router obtiene el Service con Depends y nunca abre el Unit of Work."""
    return CategoriaService(CategoriaUnitOfWork())


ServicioDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get(
    "",
    response_model=list[CategoriaRead],
    status_code=status.HTTP_200_OK,
    summary="Listar las categorías activas",
)
def listar_categorias(servicio: ServicioDep):
    return servicio.listar()


@router.get(
    "/{categoria_id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
    summary="Detalle de una categoría",
)
def obtener_categoria(servicio: ServicioDep, categoria_id: CategoriaId):
    try:
        return servicio.obtener(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una categoría",
    dependencies=[solo_admin],
)
def crear_categoria(servicio: ServicioDep, datos: CategoriaCreate):
    try:
        return servicio.crear(datos)
    except NombreDuplicado as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(error)
        ) from error


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
    summary="Actualizar una categoría",
    dependencies=[solo_admin],
)
def actualizar_categoria(
    servicio: ServicioDep, categoria_id: CategoriaId, datos: CategoriaUpdate
):
    try:
        return servicio.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error
    except NombreDuplicado as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(error)
        ) from error


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica de una categoría",
    dependencies=[solo_admin],
)
def eliminar_categoria(servicio: ServicioDep, categoria_id: CategoriaId) -> None:
    try:
        servicio.eliminar(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(error)
        ) from error