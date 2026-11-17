import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/features/pedidos/api/pedidos";
import type {
  EstadoPedido,
  FiltrosPedidos,
  PedidoCreate,
} from "@/features/pedidos/types";

export const CLAVE_PEDIDOS = "pedidos";

/** Listado paginado: propios o todos según el rol. */
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: [CLAVE_PEDIDOS, filtros],
    queryFn: () => api.listar(filtros),
    placeholderData: (anterior) => anterior,
  });
}

/** Detalle de un pedido. */
export function usePedido(id: number | null) {
  return useQuery({
    queryKey: [CLAVE_PEDIDOS, "detalle", id],
    queryFn: () => api.obtener(id as number),
    enabled: id !== null,
  });
}

/** Indicadores del panel de administración. */
export function useResumenPedidos() {
  return useQuery({
    queryKey: [CLAVE_PEDIDOS, "resumen"],
    queryFn: api.resumen,
  });
}

/**
 * Tras crear o cambiar un pedido hay que refrescar también los productos:
 * el stock se descontó o se restituyó del lado del servidor.
 */
function useInvalidarPedidos() {
  const cliente = useQueryClient();

  return () => {
    void cliente.invalidateQueries({ queryKey: [CLAVE_PEDIDOS] });
    void cliente.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos();

  return useMutation({
    mutationFn: (datos: PedidoCreate) => api.crear(datos),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos();

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      api.cambiarEstado(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos();

  return useMutation({
    mutationFn: (id: number) => api.cancelar(id),
    onSuccess: invalidar,
  });
}