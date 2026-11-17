import type {
  CredencialesLogin,
  DatosRegistro,
  Usuario,
} from "@/features/auth/types";
import { axiosInstance } from "@/shared/api/axiosInstance";

/** POST /auth/register — público, crea un usuario con rol "user". */
export async function registrar(datos: DatosRegistro): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>("/auth/register", datos);
  return data;
}

/**
 * POST /auth/token — formulario OAuth2 (no JSON). El backend establece la
 * cookie HttpOnly access_token; el cuerpo de la respuesta no trae el token.
 */
export async function login(credenciales: CredencialesLogin): Promise<void> {
  const cuerpo = new URLSearchParams();
  cuerpo.set("username", credenciales.username);
  cuerpo.set("password", credenciales.password);

  await axiosInstance.post("/auth/token", cuerpo, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

/** POST /auth/logout — borra la cookie. */
export async function logout(): Promise<void> {
  await axiosInstance.post("/auth/logout");
}

/** GET /auth/me — usuario autenticado según la cookie. */
export async function obtenerPerfil(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>("/auth/me");
  return data;
}
