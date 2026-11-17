from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Expone productos y categorías sobre la misma sesión.

    Hace falta el repositorio de categorías para validar que la categoría
    exista y esté activa al crear o editar un producto.
    """

    productos: ProductoRepository
    categorias: CategoriaRepository

    def _crear_repositorios(self) -> None:
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)