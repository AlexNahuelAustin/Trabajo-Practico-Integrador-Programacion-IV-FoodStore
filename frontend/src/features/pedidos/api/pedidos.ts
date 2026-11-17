import type {
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  EstadoPedido,
  ResumenPedidos,
} from "@/features/pedidos/types";
import { axiosInstance } from "@/shared/api/axiosInstance";

/** POST /pedidos — crea el pedido desde el carrito (RN-01). */
export async function crear(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>("/pedidos", datos);
  return data;
}

/** GET /pedidos — propios (user) o todos (admin). */
export async function listar(
  filtros: FiltrosPedidos = {},
): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", {
    params: {
      skip: filtros.skip ?? 0,
      limit: filtros.limit ?? 20,
      estado: filtros.estado,
    },
  });
  return data;
}

/** GET /pedidos/{id} — detalle con sus líneas. */
export async function obtener(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`);
  return data;
}

/** GET /pedidos/resumen — indicadores del panel (admin). */
export async function resumen(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}

/** PATCH /pedidos/{id}/estado — admin (RN-02, RN-03). */
export async function cambiarEstado(
  id: number,
  estado: EstadoPedido,
): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, {
    estado,
  });
  return data;
}

/** PATCH /pedidos/{id}/cancelar — el dueño, solo en PENDIENTE (RN-03, RN-04). */
export async function cancelar(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}