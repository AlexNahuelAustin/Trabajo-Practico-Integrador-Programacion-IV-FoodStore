export * as apiProductos from "./api/productos";
export { FiltrosCatalogo } from "./components/FiltrosCatalogo";
export { ProductoCard } from "./components/ProductoCard";
export { ProductoForm } from "./components/ProductoForm";
export { StockForm } from "./components/StockForm";
export { TablaProductos } from "./components/TablaProductos";
export {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProducto,
  useProductos,
} from "./hooks/useProductos";
export { AdminProductosPage } from "./pages/AdminProductosPage";
export { CatalogoPage } from "./pages/CatalogoPage";
export type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "./types";