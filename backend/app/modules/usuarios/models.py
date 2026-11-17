from datetime import datetime, timezone
from typing import TYPE_CHECKING, ClassVar, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    __tablename__: ClassVar[str] = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=120)
    email: str = Field(max_length=254, unique=True, index=True)
    hashed_password: str = Field(max_length=60)
    role: str = Field(default="user", max_length=20)
    # Baja lógica: el usuario no se borra, se desactiva
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")