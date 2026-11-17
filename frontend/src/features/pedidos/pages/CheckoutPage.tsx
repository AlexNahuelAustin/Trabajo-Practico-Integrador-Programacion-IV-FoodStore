import { Link, useNavigate } from "react-router-dom";

import { CheckoutForm } from "@/features/pedidos/components/CheckoutForm";
import type { DatosCheckout } from "@/features/pedidos/components/CheckoutForm";
import { useCrearPedido } from "@/features/pedidos/hooks/usePedidos";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formatear";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";

export function CheckoutPage() {
  const items = useCartStore((estado) => estado.items);
  const total = useCartStore((estado) => estado.total);
  const vaciar = useCartStore((estado) => estado.vaciar);
  const crearPedido = useCrearPedido();
  const mostrar = useNotificationStore((estado) => estado.mostrar);
  const navegar = useNavigate();

  function confirmar(datos: DatosCheckout) {
    crearPedido.mutate(
      {
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
        ...datos,
      },
      {
        onSuccess: (pedido) => {
          vaciar();
          mostrar("exito", `Pedido #${pedido.id} confirmado`);
          navegar("/mis-pedidos", { replace: true });
        },
        // El backend es la autoridad sobre el stock: si cambió mientras
        // el carrito estaba guardado, el error llega acá.
        onError: (error) => mostrar("error", mensajeDeError(error)),
      },
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Confirmar pedido</h1>
        <EstadoVacio
          titulo="No hay nada para confirmar"
          descripcion="Tu carrito está vacío."
          accion={
            <Link
              to="/"
              className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-violet-950 transition hover:bg-amber-300"
            >
              Ir al catálogo
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Confirmar pedido</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Datos de entrega</h2>
          <CheckoutForm
            enviando={crearPedido.isPending}
            onConfirmar={confirmar}
          />
        </Card>

        <Card className="h-fit">
          <h2 className="mb-4 text-lg font-semibold">Tu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li
                key={item.producto_id}
                className="flex justify-between gap-4 border-b border-slate-100 pb-2 dark:border-slate-800"
              >
                <span>
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-medium">Total</span>
            <span className="text-2xl font-bold">{formatearPrecio(total())}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}