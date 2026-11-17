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

import type { Producto } from "@/features/productos/types";
import { Button } from "@/shared/ui/Button";
import { formatearPrecio } from "@/shared/utils/formatear";

type Props = {
  productos: Producto[];
  onEditar: (producto: Producto) => void;
  onStock: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
};

const columna = createColumnHelper<Producto>();

export function TablaProductos({
  productos,
  onEditar,
  onStock,
  onEliminar,
}: Props) {
  const [orden, setOrden] = useState<SortingState>([]);

  const columnas = [
    columna.accessor("id", { header: "#" }),
    columna.accessor("nombre", {
      header: "Nombre",
      cell: (celda) => <span className="font-medium">{celda.getValue()}</span>,
    }),
    columna.accessor((fila) => fila.categoria.nombre, {
      id: "categoria",
      header: "Categoría",
    }),
    columna.accessor("precio_base", {
      header: "Precio",
      cell: (celda) => formatearPrecio(celda.getValue()),
    }),
    columna.accessor("stock", {
      header: "Stock",
      cell: (celda) => (
        <span
          className={
            celda.getValue() === 0 ? "font-semibold text-red-600" : undefined
          }
        >
          {celda.getValue()}
        </span>
      ),
    }),
    columna.accessor("disponible", {
      header: "Disponible",
      cell: (celda) => (celda.getValue() ? "Sí" : "No"),
    }),
    columna.display({
      id: "acciones",
      header: "Acciones",
      cell: (celda) => (
        <div className="flex flex-wrap gap-2">
          <Button
            tamanio="sm"
            variante="secundario"
            onClick={() => onEditar(celda.row.original)}
          >
            Editar
          </Button>
          <Button
            tamanio="sm"
            variante="secundario"
            onClick={() => onStock(celda.row.original)}
          >
            Stock
          </Button>
          <Button
            tamanio="sm"
            variante="peligro"
            onClick={() => onEliminar(celda.row.original)}
          >
            Dar de baja
          </Button>
        </div>
      ),
    }),
  ];

  const tabla = useReactTable({
    data: productos,
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