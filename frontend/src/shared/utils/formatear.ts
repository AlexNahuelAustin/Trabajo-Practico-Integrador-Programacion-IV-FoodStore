/** Formatea un número como precio en pesos argentinos. */
export function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(valor);
}

/** Formatea una fecha ISO del backend como dd/mm/aaaa hh:mm. */
export function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}