import { useState } from "react";
import { Link } from "react-router-dom";

import { DetallePedido } from "@/features/pedidos/components/DetallePedido";
import { TablaPedidos } from "@/features/pedidos/components/TablaPedidos";
import {
  useCancelarPedido,
  usePedidos,
} from "@/features/pedidos/hooks/usePedidos";
import type { Pedido } from "@/features/pedidos/types";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { useNotificationStore } from "@/store/notificationStore";

const POR_PAGINA = 20;

export function MisPedidosPage() {
  const [skip, setSkip] = useState(0);
  const [verDetalle, setVerDetalle] = useState<Pedido | null>(null);

  const { data, isPending, isError, error, refetch } = usePedidos({
    skip,
    limit: POR_PAGINA,
  });
  const cancelar = useCancelarPedido();
  const mostrar = useNotificationStore((estado) => estado.mostrar);

  function cancelarPedido(pedido: Pedido) {
    const confirmado = window.confirm(
      `¿Cancelar el pedido #${pedido.id}? Se devuelve el stock de los productos.`,
    );
    if (!confirmado) return;

    cancelar.mutate(pedido.id, {
      onSuccess: () => mostrar("exito", "Pedido cancelado"),
      onError: (error) => mostrar("error", mensajeDeError(error)),
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>

      {isPending && <SkeletonFilas cantidad={5} />}

      {isError && (
        <EstadoError
          mensaje={mensajeDeError(error)}
          onReintentar={() => void refetch()}
        />
      )}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hiciste ningún pedido"
          descripcion="Cuando confirmes uno, lo vas a ver acá con su estado."
          accion={
            <Link
              to="/"
              className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-violet-950 transition hover:bg-amber-300"
            >
              Ir al catálogo
            </Link>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <TablaPedidos
            pedidos={data.items}
            acciones={(pedido) => (
              <>
                <Button
                  tamanio="sm"
                  variante="secundario"
                  onClick={() => setVerDetalle(pedido)}
                >
                  Ver detalle
                </Button>
                {/* Solo se puede cancelar en PENDIENTE (RN-04) */}
                {pedido.estado === "PENDIENTE" && (
                  <Button
                    tamanio="sm"
                    variante="peligro"
                    disabled={cancelar.isPending}
                    onClick={() => cancelarPedido(pedido)}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}
          />

          <Paginacion
            total={data.total}
            skip={skip}
            limit={POR_PAGINA}
            onCambiarSkip={setSkip}
          />
        </>
      )}

      <Modal
        abierto={verDetalle !== null}
        titulo={`Pedido #${verDetalle?.id ?? ""}`}
        onCerrar={() => setVerDetalle(null)}
      >
        {verDetalle && <DetallePedido pedido={verDetalle} />}
      </Modal>
    </div>
  );
}