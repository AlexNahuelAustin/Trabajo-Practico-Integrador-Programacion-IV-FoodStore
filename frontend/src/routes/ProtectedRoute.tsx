import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Rol } from "@/features/auth/types";

type Props = {
  /** Si no se indica, alcanza con tener sesión (cualquier rol). */
  roles?: Rol[];
};

/**
 * Sin sesión redirige a /login; sin el rol, a /unauthorized. Mientras
 * checkSession todavía no confirmó la sesión, muestra un indicador: ocultar
 * un botón en la UI no reemplaza a require_role del backend.
 */
export function ProtectedRoute({ roles }: Props) {
  const { usuario, verificado } = useAuth();
  const ubicacion = useLocation();

  if (!verificado) {
    return (
      <div className="flex justify-center py-20 text-sm text-slate-500 dark:text-slate-400">
        Cargando sesión...
      </div>
    );
  }

  if (!usuario) {
    return (
      <Navigate
        to="/login"
        state={{ desde: ubicacion.pathname }}
        replace
      />
    );
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
