export * as apiCategorias from "./api/categorias";
export { CategoriaForm } from "./components/CategoriaForm";
export { TablaCategorias } from "./components/TablaCategorias";
export {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "./hooks/useCategorias";
export { AdminCategoriasPage } from "./pages/AdminCategoriasPage";
export type { Categoria, CategoriaCreate, CategoriaUpdate } from "./types";