type Props = {
  /** Cuántos bloques dibujar. */
  cantidad?: number;
  className?: string;
};

/** Bloque gris animado que ocupa el lugar del contenido mientras carga. */
export function Skeleton({ cantidad = 1, className = "h-4 w-full" }: Props) {
  return (
    <>
      {Array.from({ length: cantidad }, (_, indice) => (
        <div
          key={indice}
          className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`}
        />
      ))}
    </>
  );
}

/** Grilla de tarjetas de producto en estado de carga. */
export function SkeletonTarjetas({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: cantidad }, (_, indice) => (
        <div
          key={indice}
          className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-3 h-32 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="mb-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mb-4 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-full rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );
}

/** Filas grises para las tablas del panel. */
export function SkeletonFilas({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: cantidad }, (_, indice) => (
        <div
          key={indice}
          className="h-12 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700"
        />
      ))}
    </div>
  );
}