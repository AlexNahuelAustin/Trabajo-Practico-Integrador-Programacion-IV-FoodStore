from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session

from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

NOMBRE_COOKIE = "access_token"


class OAuth2PasswordBearerConCookie(OAuth2PasswordBearer):
    """Extiende el esquema de FastAPI para leer el token de la cookie HttpOnly.

    El esquema original solo mira el encabezado Authorization; acá se busca
    primero en la cookie.
    """

    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get(NOMBRE_COOKIE)
        if token:
            return token
        return await super().__call__(request)


esquema_oauth = OAuth2PasswordBearerConCookie(tokenUrl="/api/v1/auth/token")

SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(esquema_oauth)]


def get_current_user(session: SessionDep, token: TokenDep) -> Usuario:
    """Valida el JWT de la cookie y carga el usuario. 401 si no es válido."""
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la sesión",
        headers={"WWW-Authenticate": "Bearer"},
    )

    usuario_id = decode_access_token(token)
    if usuario_id is None:
        raise credenciales_invalidas

    usuario = session.get(Usuario, usuario_id)
    if usuario is None:
        raise credenciales_invalidas

    return usuario


UsuarioDep = Annotated[Usuario, Depends(get_current_user)]


def get_current_active_user(usuario: UsuarioDep) -> Usuario:
    """Rechaza las cuentas dadas de baja lógicamente. 400 si está desactivada."""
    if usuario.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return usuario


UsuarioActivoDep = Annotated[Usuario, Depends(get_current_active_user)]


def require_role(roles_permitidos: list[str]) -> Callable[..., Usuario]:
    """Fábrica de dependencias: exige uno de los roles indicados. 403 si no lo tiene."""

    def verificar_rol(usuario: UsuarioActivoDep) -> Usuario:
        if usuario.role not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta operación",
            )
        return usuario

    return verificar_rol


# Atajos de uso frecuente
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]
solo_admin = Depends(require_role(["admin"]))