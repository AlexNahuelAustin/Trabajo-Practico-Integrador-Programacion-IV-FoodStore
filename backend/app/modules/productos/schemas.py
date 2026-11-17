from typing import Annotated, Optional

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=2, max_length=150),
]


class ProductoCreate(SQLModel):
    nombre: NombreProducto
    descripcion: str = Field(default="", max_length=1000)
    precio_base: float = Field(ge=0)
    imagen_url: str = Field(default="", max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int = Field(gt=0)


class ProductoUpdate(SQLModel):
    """PUT parcial: actualiza los campos enviados y conserva los demás."""

    nombre: Optional[NombreProducto] = None
    descripcion: Optional[str] = Field(default=None, max_length=1000)
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = Field(default=None, max_length=500)
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = None
    categoria_id: Optional[int] = Field(default=None, gt=0)


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: Optional[CategoriaRead] = None


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]