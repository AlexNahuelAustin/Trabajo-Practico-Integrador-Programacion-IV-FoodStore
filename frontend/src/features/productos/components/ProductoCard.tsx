import type { Producto } from "@/features/productos/types";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formatear";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";

type Props = {
  producto: Producto;
};

export function ProductoCard({ producto }: Props) {
  const agregar = useCartStore((estado) => estado.agregar);
  const mostrar = useNotificationStore((estado) => estado.mostrar);

  const sinStock = producto.stock === 0;
  const noSeVende = !producto.disponible || sinStock;

  function alAgregar() {
    agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      stock_disponible: producto.stock,
      imagen_url: producto.imagen_url,
    });
    mostrar("exito", `${producto.nombre} agregado al carrito`);
  }

  return (
    <Card
      className={
        "flex flex-col !border-blue-200 transition-all duration-300 " +
        "hover:-translate-y-0.5 hover:!border-amber-400 " +
        "hover:shadow-[0_0_18px_-2px_rgba(251,191,36,0.6)] " +
        "dark:!border-blue-900/70 dark:hover:!border-amber-400"
      }
    >
      <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-md bg-blue-50 dark:bg-blue-950/60">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl" aria-hidden="true">
            🍽️
          </span>
        )}
      </div>

      <span className="mb-1 inline-block w-fit rounded bg-blue-800 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-300">
        {producto.categoria.nombre}
      </span>

      <h3 className="font-semibold">{producto.nombre}</h3>

      {producto.descripcion && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {producto.descripcion}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-lg font-bold">
          {formatearPrecio(producto.precio_base)}
        </span>
        <span
          className={`text-xs font-medium ${
            sinStock
              ? "text-red-600 dark:text-red-400"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {sinStock ? "Sin stock" : `${producto.stock} disponibles`}
        </span>
      </div>

      <Button
        className="mt-4 w-full"
        disabled={noSeVende}
        onClick={alAgregar}
        title={noSeVende ? "No disponible por el momento" : undefined}
      >
        {noSeVende ? "No disponible" : "Agregar al carrito"}
      </Button>
    </Card>
  );
}