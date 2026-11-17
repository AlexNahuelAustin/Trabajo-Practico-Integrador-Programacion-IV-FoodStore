import { Button } from "@/shared/ui/Button";

type Props = {
  total: number;
  skip: number;
  limit: number;
  onCambiarSkip: (nuevoSkip: number) => void;
};

export function Paginacion({ total, skip, limit, onCambiarSkip }: Props) {
  const paginaActual = Math.floor(skip / limit) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / limit));

  const hayAnterior = skip > 0;
  const haySiguiente = skip + limit < total;

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 text-sm text-slate-600 dark:text-slate-300">
      <span>
        {total} {total === 1 ? "resultado" : "resultados"} · página{" "}
        {paginaActual} de {totalPaginas}
      </span>

      <div className="flex gap-2">
        <Button
          variante="secundario"
          tamanio="sm"
          disabled={!hayAnterior}
          onClick={() => onCambiarSkip(Math.max(0, skip - limit))}
        >
          Anterior
        </Button>
        <Button
          variante="secundario"
          tamanio="sm"
          disabled={!haySiguiente}
          onClick={() => onCambiarSkip(skip + limit)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}