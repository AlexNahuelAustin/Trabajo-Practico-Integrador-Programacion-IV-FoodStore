import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL;

/** Cliente HTTP único de la aplicación. */
export const axiosInstance = axios.create({
  baseURL: API_URL,
  // Sin esto el navegador no manda la cookie HttpOnly del login.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * La reacción a perder la sesión la decide el store, no esta capa.
 * Se registra desde main.tsx para no acoplar el cliente HTTP al estado.
 */
type ManejadorSesion = (mensaje: string) => void;

let alPerderSesion: ManejadorSesion | null = null;

export function registrarManejadorDeSesion(manejador: ManejadorSesion) {
  alPerderSesion = manejador;
}

const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

axiosInstance.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
      const estado = error.response?.status;
      const url = error.config?.url ?? "";
      const detalle = error.response?.data?.detail;

      // Estos dos endpoints manejan sus propios 401:
      // /auth/me devuelve 401 al arrancar sin sesión (es normal),
      // /auth/token devuelve 401 con la contraseña incorrecta.
      const losManejaOtro =
        url.includes("/auth/token") || url.includes("/auth/me");

      const perdioLaSesion =
        (estado === 401 && !losManejaOtro) ||
        (estado === 400 && detalle === CUENTA_DESACTIVADA);

      if (perdioLaSesion && alPerderSesion) {
        alPerderSesion(
          estado === 400
            ? "Tu cuenta fue desactivada."
            : "Tu sesión expiró. Iniciá sesión de nuevo.",
        );
      }
    }

    return Promise.reject(error);
  },
);