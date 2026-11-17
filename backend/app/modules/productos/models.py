from typing import TYPE_CHECKING, ClassVar, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__: ClassVar[str] = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str = Field(max_length=150, index=True)
    descripcion: str = Field(default="", max_length=1000)
    precio_base: float = Field(ge=0)
    imagen_url: str = Field(default="", max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    # Baja lógica
    activo: bool = Field(default=True)

    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")