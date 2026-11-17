from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    """Expone el repositorio de usuarios sobre la sesión de la transacción."""

    usuarios: UsuarioRepository

    def _crear_repositorios(self) -> None:
        self.usuarios = UsuarioRepository(self.session)