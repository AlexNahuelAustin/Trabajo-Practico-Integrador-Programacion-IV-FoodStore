import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from "@/features/categorias/types";
import { axiosInstance } from "@/shared/api/axiosInstance";

/** GET /categorias — solo las activas (público). */
export async function listar(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>("/categorias");
  return data;
}

/** GET /categorias/{id} */
export async function obtener(id: number): Promise<Categoria> {
  const { data } = await axiosInstance.get<Categoria>(`/categorias/${id}`);
  return data;
}

/** POST /categorias — admin. */
export async function crear(datos: CategoriaCreate): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>("/categorias", datos);
  return data;
}

/** PUT /categorias/{id} — admin, actualización parcial. */
export async function actualizar(
  id: number,
  datos: CategoriaUpdate,
): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(
    `/categorias/${id}`,
    datos,
  );
  return data;
}

/** DELETE /categorias/{id} — admin, baja lógica. Responde 204. */
export async function eliminar(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`);
}