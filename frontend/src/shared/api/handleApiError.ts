import axios from "axios";

/** Forma del cuerpo de error que devuelve FastAPI. */
type RespuestaError = {
  detail?: string | { msg: string }[];
};

/**
 * Convierte el detail de la API en un mensaje mostrable.
 * FastAPI manda un string en los HTTPException y una lista en los 422.
 */
export function mensajeDeError(
  error: unknown,
  porDefecto = "Ocurrió un error inesperado",
): string {
  if (axios.isAxiosError<RespuestaError>(error)) {
    if (error.code === "ERR_NETWORK") {
      return "No se pudo conectar con el servidor. ¿Está levantado el backend?";
    }

    const detalle = error.response?.data?.detail;

    if (typeof detalle === "string") {
      return detalle;
    }

    if (Array.isArray(detalle) && detalle.length > 0) {
      return detalle.map((problema) => problema.msg).join(". ");
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return porDefecto;
}