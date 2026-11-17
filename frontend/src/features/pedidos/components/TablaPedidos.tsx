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
import type { ReactNode } from "react";

import type { Pedido } from "@/features/pedidos/types";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formatear";

type Props = {
  pedidos: Pedido[];
  /** Botones propios de cada pantalla (cancelar, avanzar, etc.). */
  acciones: (pedido: Pedido) => ReactNode;
  /** Solo el panel de administración muestra de quién es el pedido. */
  mostrarUsuario?: boolean;
};

const columna = createColumnHelper<Pedido>();

export function TablaPedidos({
  pedidos,
  acciones,
  mostrarUsuario = false,
}: Props) {
  const [orden, setOrden] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);

  const columnas = [
    columna.accessor("id", { header: "#" }),
    columna.accessor("created_at", {
      header: "Fecha",
      cell: (celda) => formatearFecha(celda.getValue()),
    }),
    ...(mostrarUsuario
      ? [columna.accessor("usuario_id", { header: "Usuario" })]
      : []),
    columna.accessor("estado", {
      header: "Estado",
      cell: (celda) => <BadgeEstado estado={celda.getValue()} />,
    }),
    columna.accessor("forma_pago", {
      header: "Pago",
      cell: (celda) =>
        celda.getValue() === "EFECTIVO" ? "Efectivo" : "Transferencia",
    }),
    columna.accessor((fila) => fila.items.length, {
      id: "lineas",
      header: "Ítems",
      enableSorting: false,
    }),
    columna.accessor("total", {
      header: "Total",
      cell: (celda) => (
        <span className="font-semibold">{formatearPrecio(celda.getValue())}</span>
      ),
    }),
    columna.display({
      id: "acciones",
      header: "Acciones",
      cell: (celda) => (
        <div className="flex flex-wrap gap-2">{acciones(celda.row.original)}</div>
      ),
    }),
  ];

  const tabla = useReactTable({
    data: pedidos,
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