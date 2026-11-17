from typing import Annotated

from fastapi import APIRouter, Depends, Path, status

from app.core.deps import AdminDep, solo_admin
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(
    prefix="/admin/usuarios",
    tags=["usuarios"],
    dependencies=[solo_admin],
)

UsuarioId = Annotated[int, Path(gt=0, description="ID del usuario")]


def get_usuario_service() -> UsuarioService:
    """Proveedor de dependencias: arma el Service con su Unit of Work."""
    return UsuarioService(UsuarioUnitOfWork())


ServicioDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get(
    "",
    response_model=list[UserPublic],
    status_code=status.HTTP_200_OK,
    summary="Listar todos los usuarios",
)
def listar_usuarios(servicio: ServicioDep):
    return servicio.listar()


@router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Activar una cuenta (disabled = false)",
)
def activar_usuario(servicio: ServicioDep, usuario_id: UsuarioId):
    return servicio.activar(usuario_id)


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Desactivar una cuenta (disabled = true)",
)
def desactivar_usuario(
    servicio: ServicioDep, usuario_id: UsuarioId, admin: AdminDep
):
    return servicio.desactivar(usuario_id, admin.id or 0)