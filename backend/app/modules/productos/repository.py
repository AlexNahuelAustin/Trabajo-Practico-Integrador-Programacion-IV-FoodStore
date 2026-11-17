from collections.abc import Sequence

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, Sequence[Producto]]:
        """Listado paginado de productos activos, con búsqueda y filtros.

        Devuelve el total que cumple los filtros y la página pedida.
        """
        consulta = select(Producto).where(col(Producto.activo).is_(True))

        if search:
            # ilike: búsqueda parcial sin distinguir mayúsculas
            consulta = consulta.where(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            consulta = consulta.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            consulta = consulta.where(col(Producto.disponible).is_(disponible))

        # El total se cuenta sobre la consulta ya filtrada, antes de paginar
        consulta_total = select(func.count()).select_from(consulta.subquery())
        total = self.session.exec(consulta_total).one()

        items = self.session.exec(
            consulta.order_by(col(Producto.id)).offset(skip).limit(limit)
        ).all()

        return total, items