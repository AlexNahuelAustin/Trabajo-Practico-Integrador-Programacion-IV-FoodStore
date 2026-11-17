import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";

import type { Usuario } from "@/features/usuarios/types";
import { Button } from "@/shared/ui/Button";

type Props = {
  usuarios: Usuario[];
  /** Id del usuario de la sesión: en su fila no se muestra "Desactivar". */
  idPropio: number | undefined;
  procesando: boolean;
  onActivar: (usuario: Usuario) => void;
  onDesactivar: (usuario: Usuario) => void;
};

const columna = createColumnHelper<Usuario>();

export function TablaUsuarios({
  usuarios,
  idPropio,
  procesando,
  onActivar,
  onDesactivar,
}: Props) {
  const [orden, setOrden] = useState<SortingState>([]);

  const columnas = [
    columna.accessor("username", {
      header: "Usuario",
      cell: (celda) => <span className="font-medium">{celda.getValue()}</span>,
    }),
    columna.accessor("full_name", { header: "Nombre" }),
    columna.accessor("email", { header: "Email" }),
    columna.accessor("role", {
      header: "Rol",
      cell: (celda) => (
        <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold uppercase dark:bg-slate-700">
          {celda.getValue()}
        </span>
      ),
    }),
    columna.accessor("disabled", {
      header: "Estado",
      cell: (celda) =>
        celda.getValue() ? (
          <span className="font-medium text-red-600 dark:text-red-400">
            Desactivado
          </span>
        ) : (
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            Activo
          </span>
        ),
    }),
    columna.display({
      id: "acciones",
      header: "Acciones",
      cell: (celda) => {
        const usuario = celda.row.original;
        const esElMismo = usuario.id === idPropio;

        return (
          <div className="flex flex-wrap gap-2">
            {usuario.disabled ? (
              <Button
                tamanio="sm"
                disabled={procesando}
                onClick={() => onActivar(usuario)}
              >
                Activar
              </Button>
            ) : (
              // El admin no puede desactivarse a sí mismo.
              !esElMismo && (
                <Button
                  tamanio="sm"
                  variante="peligro"
                  disabled={procesando}
                  onClick={() => onDesactivar(usuario)}
                >
                  Desactivar
                </Button>
              )
            )}
            {esElMismo && (
              <span className="self-center text-xs text-slate-500 dark:text-slate-400">
                (vos)
              </span>
            )}
          </div>
        );
      },
    }),
  ];

  const tabla = useReactTable({
    data: usuarios,
    columns: columnas,
    state: { sorting: orden },
    onSortingChange: setOrden,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((encabezado) => (
                  <th key={encabezado.id} className="px-4 py-3 font-semibold">
                    {encabezado.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={encabezado.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none hover:text-amber-600"
                      >
                        {flexRender(
                          encabezado.column.columnDef.header,
                          encabezado.getContext(),
                        )}
                        {{ asc: " ▲", desc: " ▼" }[
                          encabezado.column.getIsSorted() as string
                        ] ?? ""}
                      </button>
                    ) : (
                      flexRender(
                        encabezado.column.columnDef.header,
                        encabezado.getContext(),
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tabla.getRowModel().rows.map((fila) => (
              <tr
                key={fila.id}
                className="border-t border-slate-200 dark:border-slate-700"
              >
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-4 py-3">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tabla.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-4 py-3 text-sm text-slate-600 dark:text-slate-300">
          <span>
            Página {tabla.getState().pagination.pageIndex + 1} de{" "}
            {tabla.getPageCount()}
          </span>
          <div className="flex gap-2">
            <Button
              tamanio="sm"
              variante="secundario"
              disabled={!tabla.getCanPreviousPage()}
              onClick={() => tabla.previousPage()}
            >
              Anterior
            </Button>
            <Button
              tamanio="sm"
              variante="secundario"
              disabled={!tabla.getCanNextPage()}
              onClick={() => tabla.nextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}