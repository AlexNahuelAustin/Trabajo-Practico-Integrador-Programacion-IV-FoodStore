from sqlmodel import SQLModel

# Los schemas de usuario se reutilizan del módulo usuarios: auth no define
# modelos propios, usa el modelo Usuario.
from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["UserCreate", "UserPublic", "MensajeRespuesta"]


class MensajeRespuesta(SQLModel):
    """Respuesta simple del login y del logout."""

    message: str