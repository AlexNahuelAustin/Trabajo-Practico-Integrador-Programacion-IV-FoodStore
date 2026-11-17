import { useEffect, useState } from "react";

import { useCategorias } from "@/features/categorias/hooks/useCategorias";

type Props = {
  busqueda: string;
  categoriaId: number | undefined;
  onCambiarBusqueda: (valor: string) => void;
  onCambiarCategoria: (valor: number | undefined) => void;
};

const CLASE_CONTROL =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-amber-500 dark:border-slate-600 dark:bg-slate-800";

export function FiltrosCatalogo({
  busqueda,
  categoriaId,
  onCambiarBusqueda,
  onCambiarCategoria,
}: Props) {
  const { data: categorias } = useCategorias();
  const [texto, setTexto] = useState(busqueda);

  // Espera medio segundo sin tipear antes de avisar: una consulta por búsqueda,
  // no una por tecla.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      if (texto !== busqueda) onCambiarBusqueda(texto);
    }, 500);

    return () => clearTimeout(temporizador);
  }, [texto, busqueda, onCambiarBusqueda]);

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="sm:col-span-2">
        <label htmlFor="busqueda" className="mb-1 block text-sm font-medium">
          Buscar
        </label>
        <input
          id="busqueda"
          type="search"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Pizza, empanada, hamburguesa..."
          className={CLASE_CONTROL}
        />
      </div>

      <div>
        <label htmlFor="categoria" className="mb-1 block text-sm font-medium">
          Categoría
        </label>
        <select
          id="categoria"
          value={categoriaId ?? ""}
          onChange={(evento) =>
            onCambiarCategoria(
              evento.target.value === "" ? undefined : Number(evento.target.value),
            )
          }
          className={CLASE_CONTROL}
        >
          <option value="">Todas</option>
          {categorias?.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={() => {
            setTexto("");
            onCambiarBusqueda("");
            onCambiarCategoria(undefined);
          }}
          className="w-full cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}