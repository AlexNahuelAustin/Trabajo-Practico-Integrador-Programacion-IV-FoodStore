from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        """Registro público: siempre crea usuarios con rol user."""
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El nombre de usuario ya está registrado",
                )
            if uow.usuarios.get_by_email(datos.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El email ya está registrado",
                )

            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=datos.email,
                hashed_password=hash_password(datos.password),
                role="user",
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> int:
        """Devuelve el id del usuario si las credenciales son válidas."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)

            # Mismo mensaje para usuario inexistente y contraseña incorrecta:
            # no se le informa a un atacante qué cuentas existen.
            if usuario is None or not verify_password(
                password, usuario.hashed_password
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos",
                )

            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada",
                )

            return usuario.id or 0

    def perfil(self, usuario: Usuario) -> UserPublic:
        return UserPublic.model_validate(usuario)