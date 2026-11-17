import type { TipoNotificacion } from "@/store/notificationStore";
import { useNotificationStore } from "@/store/notificationStore";

const ESTILOS: Record<TipoNotificacion, string> = {
  exito:
    "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
  error:
    "bg-red-50 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
  info: "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
};

export function Toast() {
  const notificaciones = useNotificationStore((estado) => estado.notificaciones);
  const quitar = useNotificationStore((estado) => estado.quitar);

  if (notificaciones.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {notificaciones.map((notificacion) => (
        <div
          key={notificacion.id}
          role="alert"
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${ESTILOS[notificacion.tipo]}`}
        >
          <span className="flex-1">{notificacion.mensaje}</span>
          <button
            type="button"
            onClick={() => quitar(notificacion.id)}
            aria-label="Cerrar aviso"
            className="cursor-pointer text-lg leading-none opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}