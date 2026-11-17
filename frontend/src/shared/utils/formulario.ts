/**
 * TanStack Form guarda los errores como unknown[].
 * Devuelve el primero si es un texto, para pasarlo al Input.
 */
export function primerError(errores: unknown[]): string | undefined {
  const primero = errores[0];
  return typeof primero === "string" ? primero : undefined;
}