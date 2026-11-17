import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/features/categorias/api/categorias";
import type {
  CategoriaCreate,
  CategoriaUpdate,
} from "@/features/categorias/types";

export const CLAVE_CATEGORIAS = ["categorias"];

/** Listado de categorías activas. */
export function useCategorias() {
  return useQuery({
    queryKey: CLAVE_CATEGORIAS,
    queryFn: api.listar,
  });
}

export function useCrearCategoria() {
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (datos: CategoriaCreate) => api.crear(datos),
    onSuccess: () => {
      void cliente.invalidateQueries({ queryKey: CLAVE_CATEGORIAS });
    },
  });
}

export function useActualizarCategoria() {
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) =>
      api.actualizar(id, datos),
    onSuccess: () => {
      void cliente.invalidateQueries({ queryKey: CLAVE_CATEGORIAS });
    },
  });
}

export function useEliminarCategoria() {
  const cliente = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.eliminar(id),
    onSuccess: () => {
      void cliente.invalidateQueries({ queryKey: CLAVE_CATEGORIAS });
      // Los productos muestran su categoría: también quedan desactualizados.
      void cliente.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}