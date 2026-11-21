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
import { useAuthStore } from "@/store/authStore";
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
  const usuario = useAuthStore((estado) => estado.usuario);

  // GET /pedidos devuelve todos los pedidos cuando el rol es admin. Esta es la
  // vista de cliente, así que se queda solo con los propios: la gestión de los
  // pedidos ajenos vive en el panel de administración (/admin/pedidos).
  const esAdmin = usuario?.role === "admin";
  const pedidosPropios = (data?.items ?? []).filter(
    (pedido) => pedido.usuario_id === usuario?.id,
  );

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

      {esAdmin && (
        <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          Esta pantalla muestra solo tus pedidos. Para ver y gestionar los de
          todos los clientes, entrá a{" "}
          <Link to="/admin/pedidos" className="font-semibold underline">
            Pedidos del panel
          </Link>
          .
        </p>
      )}

      {isPending && <SkeletonFilas cantidad={5} />}

      {isError && (
        <EstadoError
          mensaje={mensajeDeError(error)}
          onReintentar={() => void refetch()}
        />
      )}

      {data && pedidosPropios.length === 0 && (
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

      {data && pedidosPropios.length > 0 && (
        <>
          <TablaPedidos
            pedidos={pedidosPropios}
            acciones={(pedido) => (
              <>
                <Button
                  tamanio="sm"
                  variante="secundario"
                  onClick={() => setVerDetalle(pedido)}
                >
                  Ver detalle
                </Button>
                {/* Solo el dueño y solo en PENDIENTE (RN-04) */}
                {pedido.usuario_id === usuario?.id &&
                  pedido.estado === "PENDIENTE" && (
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

          {!esAdmin && (
            <Paginacion
              total={data.total}
              skip={skip}
              limit={POR_PAGINA}
              onCambiarSkip={setSkip}
            />
          )}
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