from fastapi import HTTPException, status
from sqlmodel import col, select

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.session.exec(
                select(Usuario).order_by(col(Usuario.id))
            ).all()
            return [UserPublic.model_validate(usuario) for usuario in usuarios]

    def _obtener(self, uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado",
            )
        return usuario

    def activar(self, usuario_id: int) -> UserPublic:
        """Idempotente: responde 200 aunque el estado no cambie."""
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)

            # El admin no puede desactivarse a sí mismo
            if usuario.id == admin_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No podés desactivar tu propia cuenta",
                )

            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)