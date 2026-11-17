import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/features/productos/api/productos";
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from "@/features/productos/types";

export const CLAVE_PRODUCTOS = "productos";

/** Listado paginado con búsqueda y filtros. */
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: [CLAVE_PRODUCTOS, filtros],
    queryFn: () => api.listar(filtros),
    // Evita el parpadeo a vacío al cambiar de página o filtro.
    placeholderData: (anterior) => anterior,
  });
}

/** Detalle de un producto. */
export function useProducto(id: number | null) {
  return useQuery({
    queryKey: [CLAVE_PRODUCTOS, "detalle", id],
    queryFn: () => api.obtener(id as number),
    enabled: id !== null,
  });
}

function useInvalidarProductos() {
  const cliente = useQueryClient();
  return () => {
    void cliente.invalidateQueries({ queryKey: [CLAVE_PRODUCTOS] });
  };
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();

  return useMutation({
    mutationFn: (datos: ProductoCreate) => api.crear(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) =>
      api.actualizar(id, datos),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) =>
      api.actualizarStock(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();

  return useMutation({
    mutationFn: (id: number) => api.eliminar(id),
    onSuccess: invalidar,
  });
}