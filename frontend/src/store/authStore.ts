import { create } from "zustand";
import { persist } from "zustand/middleware";

import * as apiAuth from "@/features/auth/api/auth";
import type {
  CredencialesLogin,
  DatosRegistro,
  Usuario,
} from "@/features/auth/types";

type EstadoAuth = {
  usuario: Usuario | null;
  cargando: boolean;
  /** false hasta que se resolvió la primera consulta a /auth/me. */
  verificado: boolean;

  verificarSesion: () => Promise<void>;
  iniciarSesion: (credenciales: CredencialesLogin) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  /** Limpia el estado sin llamar a la API (lo usa el interceptor). */
  limpiarSesion: () => void;
};

export const useAuthStore = create<EstadoAuth>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: false,
      verificado: false,

      verificarSesion: async () => {
        try {
          const usuario = await apiAuth.obtenerPerfil();
          set({ usuario });
        } catch {
          // Sin cookie válida: no hay sesión y se descarta lo persistido.
          set({ usuario: null });
        } finally {
          set({ verificado: true });
        }
      },

      iniciarSesion: async (credenciales) => {
        set({ cargando: true });
        try {
          await apiAuth.login(credenciales);
          const usuario = await apiAuth.obtenerPerfil();
          set({ usuario, verificado: true });
        } finally {
          set({ cargando: false });
        }
      },

      registrarse: async (datos) => {
        set({ cargando: true });
        try {
          await apiAuth.registrar(datos);
          // El registro no abre sesión: se inicia a continuación.
          await get().iniciarSesion({
            username: datos.username,
            password: datos.password,
          });
        } finally {
          set({ cargando: false });
        }
      },

      cerrarSesion: async () => {
        try {
          await apiAuth.logout();
        } finally {
          set({ usuario: null, verificado: true });
        }
      },

      limpiarSesion: () => set({ usuario: null, verificado: true }),
    }),
    {
      name: "auth-storage",
      // Solo el usuario. El token nunca pasa por acá: vive en la cookie.
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
);