from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Controla la transacción de un caso de uso.

    Al entrar al bloque `with` abre la sesión y crea los repositorios.
    Al salir, hace commit si no hubo errores o rollback si se produjo una
    excepción, y cierra la sesión siempre.
    """

    session: Session

    def __init__(self, crear_sesion: Callable[[], Session] = session_factory) -> None:
        self.crear_sesion = crear_sesion

    def __enter__(self) -> Self:
        self.session = self.crear_sesion()
        self._crear_repositorios()
        return self

    def _crear_repositorios(self) -> None:
        """Cada módulo lo redefine para exponer los repositorios que necesita."""

    def __exit__(
        self,
        tipo_excepcion: type[BaseException] | None,
        valor: BaseException | None,
        rastro: TracebackType | None,
    ) -> None:
        try:
            if tipo_excepcion:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()