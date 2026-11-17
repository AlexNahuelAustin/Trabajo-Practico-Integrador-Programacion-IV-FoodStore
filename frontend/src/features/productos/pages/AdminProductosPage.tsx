import { useState } from "react";

import { ProductoForm } from "@/features/productos/components/ProductoForm";
import { StockForm } from "@/features/productos/components/StockForm";
import { TablaProductos } from "@/features/productos/components/TablaProductos";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "@/features/productos/hooks/useProductos";
import type {
  Producto,
  ProductoCreate,
  ProductoStockUpdate,
} from "@/features/productos/types";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { useNotificationStore } from "@/store/notificationStore";

/** El panel trae todo de una y pagina del lado del cliente con TanStack Table. */
const LIMITE_PANEL = 100;

export function AdminProductosPage() {
  const { data, isPending, isError, error, refetch } = useProductos({
    skip: 0,
    limit: LIMITE_PANEL,
  });

  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();
  const mostrar = useNotificationStore((estado) => estado.mostrar);

  const [modalProducto, setModalProducto] = useState(false);
  const [modalStock, setModalStock] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Producto | null>(null);

  function abrirCreacion() {
    setEnEdicion(null);
    setModalProducto(true);
  }

  function abrirEdicion(producto: Producto) {
    setEnEdicion(producto);
    setModalProducto(true);
  }

  function abrirStock(producto: Producto) {
    setEnEdicion(producto);
    setModalStock(true);
  }

  function cerrar() {
    setModalProducto(false);
    setModalStock(false);
    setEnEdicion(null);
  }

  function guardar(datos: ProductoCreate) {
    if (enEdicion) {
      actualizar.mutate(
        { id: enEdicion.id, datos },
        {
          onSuccess: () => {
            mostrar("exito", "Producto actualizado");
            cerrar();
          },
          onError: (error) => mostrar("error", mensajeDeError(error)),
        },
      );
      return;
    }

    crear.mutate(datos, {
      onSuccess: () => {
        mostrar("exito", "Producto creado");
        cerrar();
      },
      onError: (error) => mostrar("error", mensajeDeError(error)),
    });
  }

  function guardarStock(datos: ProductoStockUpdate) {
    if (!enEdicion) return;

    actualizarStock.mutate(
      { id: enEdicion.id, datos },
      {
        onSuccess: () => {
          mostrar("exito", "Stock actualizado");
          cerrar();
        },
        onError: (error) => mostrar("error", mensajeDeError(error)),
      },
    );
  }

  function darDeBaja(producto: Producto) {
    const confirmado = window.confirm(
      `¿Dar de baja "${producto.nombre}"? Deja de aparecer en el catálogo.`,
    );
    if (!confirmado) return;

    eliminar.mutate(producto.id, {
      onSuccess: () => mostrar("exito", "Producto dado de baja"),
      onError: (error) => mostrar("error", mensajeDeError(error)),
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={abrirCreacion}>Nuevo producto</Button>
      </div>

      {isPending && <SkeletonFilas cantidad={6} />}

      {isError && (
        <EstadoError
          mensaje={mensajeDeError(error)}
          onReintentar={() => void refetch()}
        />
      )}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hay productos"
          descripcion="Cargá el primero para que aparezca en el catálogo."
          accion={<Button onClick={abrirCreacion}>Nuevo producto</Button>}
        />
      )}

      {data && data.items.length > 0 && (
        <TablaProductos
          productos={data.items}
          onEditar={abrirEdicion}
          onStock={abrirStock}
          onEliminar={darDeBaja}
        />
      )}

      <Modal
        abierto={modalProducto}
        titulo={enEdicion ? "Editar producto" : "Nuevo producto"}
        onCerrar={cerrar}
      >
        <ProductoForm
          key={enEdicion?.id ?? "nuevo"}
          producto={enEdicion ?? undefined}
          guardando={crear.isPending || actualizar.isPending}
          onGuardar={guardar}
          onCancelar={cerrar}
        />
      </Modal>

      <Modal abierto={modalStock} titulo="Stock y disponibilidad" onCerrar={cerrar}>
        {enEdicion && (
          <StockForm
            key={`stock-${enEdicion.id}`}
            producto={enEdicion}
            guardando={actualizarStock.isPending}
            onGuardar={guardarStock}
            onCancelar={cerrar}
          />
        )}
      </Modal>
    </div>
  );
}