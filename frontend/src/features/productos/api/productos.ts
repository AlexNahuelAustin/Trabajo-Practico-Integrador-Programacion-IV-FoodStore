import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductoStockUpdate,
  ProductosPaginados,
  ProductoUpdate,
} from "@/features/productos/types";
import { axiosInstance } from "@/shared/api/axiosInstance";

/**
 * GET /productos — público, paginado en el servidor.
 * Los filtros vacíos no se envían para no ensuciar la URL.
 */
export async function listar(
  filtros: FiltrosProductos = {},
): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>("/productos", {
    params: {
      skip: filtros.skip ?? 0,
      limit: filtros.limit ?? 20,
      search: filtros.search?.trim() || undefined,
      categoria_id: filtros.categoria_id,
      disponible: filtros.disponible,
    },
  });
  return data;
}

/** GET /productos/{id} — detalle con su categoría. */
export async function obtener(id: number): Promise<Producto> {
  const { data } = await axiosInstance.get<Producto>(`/productos/${id}`);
  return data;
}

/** POST /productos — admin. */
export async function crear(datos: ProductoCreate): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>("/productos", datos);
  return data;
}

/** PUT /productos/{id} — admin, actualización parcial. */
export async function actualizar(
  id: number,
  datos: ProductoUpdate,
): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(`/productos/${id}`, datos);
  return data;
}

/** PATCH /productos/{id}/stock — admin. */
export async function actualizarStock(
  id: number,
  datos: ProductoStockUpdate,
): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(
    `/productos/${id}/stock`,
    datos,
  );
  return data;
}

/** DELETE /productos/{id} — admin, baja lógica. Responde 204. */
export async function eliminar(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}