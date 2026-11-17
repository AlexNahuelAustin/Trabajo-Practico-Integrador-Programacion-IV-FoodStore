from collections.abc import Sequence
from datetime import datetime, time, timezone

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import EstadoPedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        estado: str | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, Sequence[Pedido]]:
        """Con usuario_id devuelve los pedidos de ese cliente; sin él, todos."""
        consulta = select(Pedido)

        if usuario_id is not None:
            consulta = consulta.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            consulta = consulta.where(Pedido.estado == estado)

        consulta_total = select(func.count()).select_from(consulta.subquery())
        total = self.session.exec(consulta_total).one()

        items = self.session.exec(
            consulta.order_by(col(Pedido.id).desc()).offset(skip).limit(limit)
        ).all()

        return total, items

    def count_by_estado(self, estado: EstadoPedido) -> int:
        consulta = (
            select(func.count())
            .select_from(Pedido)
            .where(Pedido.estado == estado.value)
        )
        return self.session.exec(consulta).one()

    def count_hoy(self) -> int:
        inicio_del_dia = datetime.combine(
            datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc
        )
        consulta = (
            select(func.count())
            .select_from(Pedido)
            .where(col(Pedido.created_at) >= inicio_del_dia)
        )
        return self.session.exec(consulta).one()

    def ingresos_entregados(self) -> float:
        consulta = select(func.coalesce(func.sum(col(Pedido.total)), 0.0)).where(
            Pedido.estado == EstadoPedido.ENTREGADO.value
        )
        return float(self.session.exec(consulta).one())