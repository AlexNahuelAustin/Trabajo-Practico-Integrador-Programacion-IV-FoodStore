import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formatear";
import { useCartStore } from "@/store/cartStore";

export function CarritoPage() {
  const items = useCartStore((estado) => estado.items);
  const cambiarCantidad = useCartStore((estado) => estado.cambiarCantidad);
  const quitar = useCartStore((estado) => estado.quitar);
  const vaciar = useCartStore((estado) => estado.vaciar);
  const total = useCartStore((estado) => estado.total);
  const { estaAutenticado } = useAuth();
  const navegar = useNavigate();

  function continuar() {
    // Sin sesión no se puede confirmar: se pasa por el login y se vuelve.
    if (!estaAutenticado) {
      navegar("/login", { state: { desde: "/checkout" } });
      return;
    }
    navegar("/checkout");
  }

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Tu carrito</h1>
        <EstadoVacio
          titulo="El carrito está vacío"
          descripcion="Agregá productos desde el catálogo para empezar un pedido."
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
      <h1 className="mb-6 text-2xl font-bold">Tu carrito</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.producto_id}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                  {item.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl" aria-hidden="true">
                      🍽️
                    </span>
                  )}
                </div>

                <div className="min-w-40 flex-1">
                  <p className="font-medium">{item.nombre}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatearPrecio(item.precio_unitario)} c/u · máx.{" "}
                    {item.stock_disponible}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    tamanio="sm"
                    variante="secundario"
                    aria-label="Quitar una unidad"
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad - 1)
                    }
                  >
                    −
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {item.cantidad}
                  </span>
                  <Button
                    tamanio="sm"
                    variante="secundario"
                    aria-label="Agregar una unidad"
                    disabled={item.cantidad >= item.stock_disponible}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad + 1)
                    }
                  >
                    +
                  </Button>
                </div>

                <span className="w-28 text-right font-semibold">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </span>

                <Button
                  tamanio="sm"
                  variante="fantasma"
                  onClick={() => quitar(item.producto_id)}
                >
                  Quitar
                </Button>
              </div>
            </Card>
          ))}

          <Button variante="secundario" onClick={vaciar}>
            Vaciar carrito
          </Button>
        </div>

        <div>
          <Card className="sticky top-24">
            <h2 className="mb-4 text-lg font-semibold">Resumen</h2>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-bold">
                {formatearPrecio(total())}
              </span>
            </div>
            <Button className="mt-4 w-full" onClick={continuar}>
              Continuar con el pedido
            </Button>
            {!estaAutenticado && (
              <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                Vas a tener que iniciar sesión para confirmarlo.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}