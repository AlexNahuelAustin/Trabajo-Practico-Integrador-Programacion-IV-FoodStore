from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# El engine administra el pool de conexiones. Se crea una sola vez.
engine = create_engine(settings.DATABASE_URL, echo=False, pool_pre_ping=True)


def create_all_tables() -> None:
    """Crea las tablas que todavía no existan.

    Importa los modelos para que SQLModel los registre en su metadata
    antes de crear el esquema.
    """
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Fábrica de sesiones: cada Unit of Work abre la suya."""
    return Session(engine)


def get_session() -> Generator[Session, None, None]:
    """Dependencia de FastAPI, para los módulos que no usan Unit of Work."""
    with Session(engine) as sesion:
        yield sesion