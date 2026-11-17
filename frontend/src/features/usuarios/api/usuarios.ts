import type { Usuario } from "@/features/usuarios/types";
import { axiosInstance } from "@/shared/api/axiosInstance";

/** GET /admin/usuarios — admin. */
export async function listar(): Promise<Usuario[]> {
  const { data } = await axiosInstance.get<Usuario[]>("/admin/usuarios");
  return data;
}

/** POST /admin/usuarios/{id}/activar — idempotente. */
export async function activar(id: number): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>(
    `/admin/usuarios/${id}/activar`,
  );
  return data;
}

/** POST /admin/usuarios/{id}/desactivar — idempotente. */
export async function desactivar(id: number): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>(
    `/admin/usuarios/${id}/desactivar`,
  );
  return data;
}