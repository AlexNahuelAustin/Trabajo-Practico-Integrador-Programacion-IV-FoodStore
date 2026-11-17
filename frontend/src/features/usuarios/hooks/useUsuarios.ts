import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/features/usuarios/api/usuarios";

export const CLAVE_USUARIOS = ["usuarios"];

export function useUsuarios() {
  return useQuery({
    queryKey: CLAVE_USUARIOS,
    queryFn: api.listar,
  });
}

function useInvalidarUsuarios() {
  const cliente = useQueryClient();
  return () => {
    void cliente.invalidateQueries({ queryKey: CLAVE_USUARIOS });
  };
}

export function useActivarUsuario() {
  const invalidar = useInvalidarUsuarios();

  return useMutation({
    mutationFn: (id: number) => api.activar(id),
    onSuccess: invalidar,
  });
}

export function useDesactivarUsuario() {
  const invalidar = useInvalidarUsuarios();

  return useMutation({
    mutationFn: (id: number) => api.desactivar(id),
    onSuccess: invalidar,
  });
}