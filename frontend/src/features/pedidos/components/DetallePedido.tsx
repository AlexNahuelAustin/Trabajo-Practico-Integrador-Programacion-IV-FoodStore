import type { Pedido } from "@/features/pedidos/types";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formatear";

type Props = {
  pedido: Pedido;
};

const TEXTO_PAGO: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
};

export function DetallePedido({ pedido }: Props) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">Pedido #{pedido.id}</span>
        <BadgeEstado estado={pedido.estado} />
      </div>

      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Fecha</dt>
          <dd>{formatearFecha(pedido.created_at)}</dd>
        </div>
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Forma de pago</dt>
          <dd>{TEXTO_PAGO[pedido.forma_pago] ?? pedido.forma_pago}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500 dark:text-slate-400">Dirección</dt>
          <dd>{pedido.direccion_entrega}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-slate-500 dark:text-slate-400">Notas</dt>
            <dd>{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="px-3 py-2 font-semibold">Producto</th>
              <th className="px-3 py-2 text-right font-semibold">Precio</th>
              <th className="px-3 py-2 text-right font-semibold">Cant.</th>
              <th className="px-3 py-2 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((linea) => (
              <tr
                key={linea.producto_id}
                className="border-t border-slate-200 dark:border-slate-700"
              >
                {/* Nombre y precio son la copia guardada al crear el pedido */}
                <td className="px-3 py-2">{linea.nombre_producto}</td>
                <td className="px-3 py-2 text-right">
                  {formatearPrecio(linea.precio_unitario)}
                </td>
                <td className="px-3 py-2 text-right">{linea.cantidad}</td>
                <td className="px-3 py-2 text-right">
                  {formatearPrecio(linea.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-300 dark:border-slate-600">
              <td colSpan={3} className="px-3 py-2 text-right font-semibold">
                Total
              </td>
              <td className="px-3 py-2 text-right text-base font-bold">
                {formatearPrecio(pedido.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}