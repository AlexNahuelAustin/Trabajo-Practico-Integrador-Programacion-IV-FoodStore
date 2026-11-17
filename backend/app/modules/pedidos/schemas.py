from datetime import datetime
from typing import Annotated, Optional

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel

from app.modules.pedidos.models import EstadoPedido, FormaPago

DireccionEntrega = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=5, max_length=200),
]


# ===== Entrada =====#
class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    # RN-01: al menos un ítem
    items: list[ItemPedidoCreate] = Field(min_length=1)
    # RN-06: forma de pago y dirección validadas en el schema
    forma_pago: FormaPago
    direccion_entrega: DireccionEntrega
    notas: Optional[str] = Field(default=None, max_length=500)
    # RN-01: que ningún producto se repita entre los ítems lo valida el
    # Service (ProductoRepetido -> 400), no el schema, para no responder 422.


class CambioEstado(SQLModel):
    estado: EstadoPedido


# ===== Salida =====#
class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead] = []


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float