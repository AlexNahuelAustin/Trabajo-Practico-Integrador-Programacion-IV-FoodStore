from datetime import datetime
from typing import Annotated, Optional

from pydantic import EmailStr, StringConstraints
from sqlmodel import Field, SQLModel

Username = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=3, max_length=50),
]
NombreCompleto = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=120),
]


class UserCreate(SQLModel):
    username: Username
    full_name: NombreCompleto
    email: EmailStr
    # La contraseña tiene un mínimo de 8 caracteres
    password: str = Field(min_length=8, max_length=72)


class UserPublic(SQLModel):
    """Nunca expone hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime


class UserLogin(SQLModel):
    username: str
    password: str


class UserUpdate(SQLModel):
    full_name: Optional[NombreCompleto] = None
    email: Optional[EmailStr] = None