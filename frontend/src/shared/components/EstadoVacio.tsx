import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descripcion?: string;
  /** Botón o enlace opcional para salir del estado vacío. */
  accion?: ReactNode;
};

export function EstadoVacio({ titulo, descripcion, accion }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
      <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
        {titulo}
      </p>
      {descripcion && (
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          {descripcion}
        </p>
      )}
      {accion}
    </div>
  );
}