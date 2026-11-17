from datetime import datetime, timezone
from enum import Enum
from typing import TYPE_CHECKING, ClassVar, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class EstadoPedido(str, Enum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(str, Enum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    __tablename__: ClassVar[str] = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default=EstadoPedido.PENDIENTE.value, max_length=20, index=True)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: Optional[str] = Field(default=None, max_length=500)
    # Suma de los subtotales; fijo desde la creación (RN-05)
    total: float = Field(default=0, ge=0)
    created_at: datetime = Field(default_factory=ahora)
    updated_at: datetime = Field(default_factory=ahora)

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Línea inmutable: guarda una copia del nombre y del precio del producto."""

    __tablename__: ClassVar[str] = "detalle_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True, ondelete="CASCADE")
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(ge=1)
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float = Field(ge=0)
    subtotal: float = Field(ge=0)

    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")