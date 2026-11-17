import type { EstadoPedido, FormaPago, Paginado } from "@/shared/types/api";

export type { EstadoPedido, FormaPago };

/** Línea del pedido: inmutable, con copia del nombre y del precio. */
export type DetallePedido = {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
};

export type Pedido = {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
};

export type ItemPedidoCreate = {
  producto_id: number;
  cantidad: number;
};

export type PedidoCreate = {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
};

export type CambioEstado = {
  estado: EstadoPedido;
};

export type ResumenPedidos = {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
};

export type FiltrosPedidos = {
  skip?: number;
  limit?: number;
  estado?: EstadoPedido;
};

export type PedidosPaginados = Paginado<Pedido>;

/** Transiciones válidas, espejo del diccionario del Service (RN-02). */
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};