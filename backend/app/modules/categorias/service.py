from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


# ===== Excepciones de dominio =====#
# El Service no sabe de HTTP: lanza estas excepciones y el Router las traduce.
class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"No existe la categoría {categoria_id}")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        """Las lecturas públicas devuelven solo los registros activos."""
        with self.uow as uow:
            categorias = uow.categorias.list_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._buscar_activa(uow, categoria_id)
            return CategoriaRead.model_validate(categoria)

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(datos.nombre):
                raise NombreDuplicado(datos.nombre)

            categoria = Categoria(
                nombre=datos.nombre, descripcion=datos.descripcion or ""
            )
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._buscar_activa(uow, categoria_id)

            if datos.nombre is not None:
                existente = uow.categorias.get_by_nombre(datos.nombre)
                if existente is not None and existente.id != categoria_id:
                    raise NombreDuplicado(datos.nombre)
                categoria.nombre = datos.nombre

            if datos.descripcion is not None:
                categoria.descripcion = datos.descripcion

            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: la fila no se borra, se marca con activo = False."""
        with self.uow as uow:
            categoria = self._buscar_activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)

    # ===== Auxiliar =====#
    def _buscar_activa(
        self, uow: CategoriaUnitOfWork, categoria_id: int
    ) -> Categoria:
        """Una categoría dada de baja se trata como inexistente."""
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria