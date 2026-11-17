import { useAuth } from "@/features/auth/hooks/useAuth";
import { TablaUsuarios } from "@/features/usuarios/components/TablaUsuarios";
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from "@/features/usuarios/hooks/useUsuarios";
import type { Usuario } from "@/features/usuarios/types";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { useNotificationStore } from "@/store/notificationStore";

export function AdminUsuariosPage() {
  const { data: usuarios, isPending, isError, error, refetch } = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();
  const mostrar = useNotificationStore((estado) => estado.mostrar);
  const { usuario: propio } = useAuth();

  function alActivar(usuario: Usuario) {
    activar.mutate(usuario.id, {
      onSuccess: () => mostrar("exito", `${usuario.username} activado`),
      onError: (error) => mostrar("error", mensajeDeError(error)),
    });
  }

  function alDesactivar(usuario: Usuario) {
    const confirmado = window.confirm(
      `¿Desactivar la cuenta de ${usuario.username}? No va a poder iniciar sesión.`,
    );
    if (!confirmado) return;

    desactivar.mutate(usuario.id, {
      onSuccess: () => mostrar("exito", `${usuario.username} desactivado`),
      onError: (error) => mostrar("error", mensajeDeError(error)),
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Usuarios</h1>

      {isPending && <SkeletonFilas cantidad={5} />}

      {isError && (
        <EstadoError
          mensaje={mensajeDeError(error)}
          onReintentar={() => void refetch()}
        />
      )}

      {usuarios && usuarios.length === 0 && (
        <EstadoVacio titulo="No hay usuarios registrados" />
      )}

      {usuarios && usuarios.length > 0 && (
        <TablaUsuarios
          usuarios={usuarios}
          idPropio={propio?.id}
          procesando={activar.isPending || desactivar.isPending}
          onActivar={alActivar}
          onDesactivar={alDesactivar}
        />
      )}
    </div>
  );
}