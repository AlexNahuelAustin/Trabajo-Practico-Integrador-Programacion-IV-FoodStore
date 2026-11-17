from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlmodel import Session, SQLModel, select

ModeloTipo = TypeVar("ModeloTipo", bound=SQLModel)


class BaseRepository(Generic[ModeloTipo]):
    """CRUD genérico sobre una entidad.

    No confirma la transacción: el commit y el rollback son responsabilidad
    exclusiva del Unit of Work.
    """

    def __init__(self, session: Session, modelo: type[ModeloTipo]) -> None:
        self.session = session
        self.modelo = modelo

    def get_by_id(self, registro_id: Any) -> ModeloTipo | None:
        return self.session.get(self.modelo, registro_id)

    def get_all(self) -> Sequence[ModeloTipo]:
        return self.session.exec(select(self.modelo)).all()

    def add(self, registro: ModeloTipo) -> ModeloTipo:
        self.session.add(registro)
        # flush envía el INSERT dentro de la transacción en curso: asigna el id
        # pero no confirma nada. Si después falla algo, el rollback lo descarta.
        self.session.flush()
        return registro

    def delete(self, registro: ModeloTipo) -> None:
        self.session.delete(registro)
        self.session.flush()