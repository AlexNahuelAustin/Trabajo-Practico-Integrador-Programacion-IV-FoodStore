from typing import Annotated, Optional

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

NombreCategoria = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2, max_length=100),
]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: str = Field(default="", max_length=500)


class CategoriaUpdate(SQLModel):
    """PUT parcial: actualiza los campos enviados y conserva los demás."""

    nombre: Optional[NombreCategoria] = None
    descripcion: Optional[str] = Field(default=None, max_length=500)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool