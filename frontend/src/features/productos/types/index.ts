import type { Categoria } from "@/features/categorias/types";
import type { Paginado } from "@/shared/types/api";

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria;
};

export type ProductoCreate = {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  categoria_id: number;
};

export type ProductoUpdate = Partial<ProductoCreate> & {
  disponible?: boolean;
};

/** Cuerpo de PATCH /productos/{id}/stock */
export type ProductoStockUpdate = {
  stock: number;
  disponible: boolean;
};

/** Query params de GET /productos */
export type FiltrosProductos = {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
};

export type ProductosPaginados = Paginado<Producto>;