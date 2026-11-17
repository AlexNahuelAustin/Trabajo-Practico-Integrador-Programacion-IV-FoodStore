import { useAuthStore } from "@/store/authStore";

/** Punto de acceso único a la sesión: lee y actúa sobre authStore. */
export function useAuth() {
  const usuario = useAuthStore((estado) => estado.usuario);
  const cargando = useAuthStore((estado) => estado.cargando);
  const verificado = useAuthStore((estado) => estado.verificado);
  const verificarSesion = useAuthStore((estado) => estado.verificarSesion);
  const iniciarSesion = useAuthStore((estado) => estado.iniciarSesion);
  const registrarse = useAuthStore((estado) => estado.registrarse);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);

  return {
    usuario,
    estaAutenticado: usuario !== null,
    cargando,
    verificado,
    verificarSesion,
    iniciarSesion,
    registrarse,
    cerrarSesion,
  };
}
