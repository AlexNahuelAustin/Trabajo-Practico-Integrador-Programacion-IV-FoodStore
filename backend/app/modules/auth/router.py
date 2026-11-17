from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import NOMBRE_COOKIE, UsuarioActivoDep
from app.core.security import create_access_token
from app.modules.auth.schemas import MensajeRespuesta
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServicioDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un usuario nuevo (rol user)",
)
def registrar(servicio: ServicioDep, datos: UserCreate):
    return servicio.registrar(datos)


@router.post(
    "/token",
    response_model=MensajeRespuesta,
    status_code=status.HTTP_200_OK,
    summary="Iniciar sesión; el JWT viaja en la cookie HttpOnly",
)
def login(
    servicio: ServicioDep,
    response: Response,
    # OAuth2 exige un formulario, no JSON
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    usuario_id = servicio.autenticar(form_data.username, form_data.password)
    token = create_access_token(usuario_id)

    response.set_cookie(
        key=NOMBRE_COOKIE,
        value=token,
        httponly=True,  # JavaScript no puede leerla: protege de XSS
        secure=False,  # en producción, con HTTPS, va True
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post(
    "/logout",
    response_model=MensajeRespuesta,
    status_code=status.HTTP_200_OK,
    summary="Cerrar sesión; borra la cookie",
)
def logout(response: Response):
    response.delete_cookie(
        key=NOMBRE_COOKIE, path="/", httponly=True, samesite="lax"
    )
    return MensajeRespuesta(message="Sesión cerrada")


@router.get(
    "/me",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Datos del usuario autenticado",
)
def perfil(servicio: ServicioDep, usuario: UsuarioActivoDep):
    return servicio.perfil(usuario)