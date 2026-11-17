/** Respuesta paginada del backend: { total, items }. */
export type Paginado<T> = {
  total: number;
  items: T[];
};

/** Parámetros comunes de paginación. */
export type ParametrosPaginacion = {
  skip?: number;
  limit?: number;
};

/** Los cuatro estados de la máquina de estados del pedido. */
export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

/** Formas de pago admitidas (RN-06). */
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";