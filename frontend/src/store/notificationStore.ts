import { create } from "zustand";

export type TipoNotificacion = "exito" | "error" | "info";

export type Notificacion = {
  id: number;
  tipo: TipoNotificacion;
  mensaje: string;
};

type EstadoNotificaciones = {
  notificaciones: Notificacion[];
  mostrar: (tipo: TipoNotificacion, mensaje: string) => void;
  quitar: (id: number) => void;
};

const DURACION_MS = 4000;
let proximoId = 1;

export const useNotificationStore = create<EstadoNotificaciones>((set, get) => ({
  notificaciones: [],

  mostrar: (tipo, mensaje) => {
    const id = proximoId++;
    set({ notificaciones: [...get().notificaciones, { id, tipo, mensaje }] });
    setTimeout(() => get().quitar(id), DURACION_MS);
  },

  quitar: (id) =>
    set({
      notificaciones: get().notificaciones.filter((n) => n.id !== id),
    }),
}));