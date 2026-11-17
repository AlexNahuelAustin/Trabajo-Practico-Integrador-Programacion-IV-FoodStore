from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Expone los repositorios de pedidos y de productos sobre la misma sesión.

    Es lo que permite que el alta del pedido y el descuento de stock ocurran
    en una sola transacción.
    """

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _crear_repositorios(self) -> None:
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)