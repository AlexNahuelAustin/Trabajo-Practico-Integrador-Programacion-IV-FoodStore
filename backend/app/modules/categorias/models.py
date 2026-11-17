from typing import TYPE_CHECKING, ClassVar, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__: ClassVar[str] = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, unique=True, index=True)
    descripcion: str = Field(default="", max_length=500)
    # Baja lógica: no libera el nombre único ni oculta sus productos
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")