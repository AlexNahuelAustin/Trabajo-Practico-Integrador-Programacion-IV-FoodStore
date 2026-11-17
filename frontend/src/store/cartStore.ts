import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ItemCarrito = {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  /** Tope informado por el backend al agregarlo. */
  stock_disponible: number;
  imagen_url: string | null;
};

type EstadoCarrito = {
  items: ItemCarrito[];

  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  quitar: (productoId: number) => void;
  vaciar: () => void;

  cantidadTotal: () => number;
  total: () => number;
};

export const useCartStore = create<EstadoCarrito>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) => {
        const items = [...get().items];
        const indice = items.findIndex(
          (actual) => actual.producto_id === item.producto_id,
        );

        if (indice === -1) {
          items.push({
            ...item,
            cantidad: Math.min(cantidad, item.stock_disponible),
          });
        } else {
          const existente = items[indice];
          items[indice] = {
            ...existente,
            // Se refrescan nombre, precio y stock por si cambiaron.
            ...item,
            cantidad: Math.min(
              existente.cantidad + cantidad,
              item.stock_disponible,
            ),
          };
        }

        set({ items });
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitar(productoId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.producto_id === productoId
              ? { ...item, cantidad: Math.min(cantidad, item.stock_disponible) }
              : item,
          ),
        });
      },

      quitar: (productoId) =>
        set({
          items: get().items.filter((item) => item.producto_id !== productoId),
        }),

      vaciar: () => set({ items: [] }),

      cantidadTotal: () =>
        get().items.reduce((suma, item) => suma + item.cantidad, 0),

      total: () =>
        get().items.reduce(
          (suma, item) => suma + item.precio_unitario * item.cantidad,
          0,
        ),
    }),
    {
      name: "cart-storage",
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
);