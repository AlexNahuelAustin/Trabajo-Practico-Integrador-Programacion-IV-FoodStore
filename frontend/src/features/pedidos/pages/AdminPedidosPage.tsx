import { useState } from "react";

import { DetallePedido } from "@/features/pedidos/components/DetallePedido";
import { TablaPedidos } from "@/features/pedidos/components/TablaPedidos";
import {
  useCambiarEstadoPedido,
  usePedidos,
} from "@/features/pedidos/hooks/usePedidos";
import type { EstadoPedido, Pedido } from "@/features/pedidos/types";
import { TRANSICIONES } from "@/features/pedidos/types";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { useNotificationStore } from "@/store/notificationStore";

const POR_PAGINA = 20;

const ETIQUETAS: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function AdminPedidosPage() {
  const [skip, setSkip] = useState(0);
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [verDetalle, setVerDetalle] = useState<Pedido | null>(null);

  const { data, isPending, isError, error, refetch } = usePedidos({
    skip,
    limit: POR_PAGINA,
    estado,
  });
  const cambiarEstado = useCambiarEstadoPedido();
  const mostrar = useNotificationStore((estado) => estado.mostrar);

  function avanzar(pedido: Pedido, nuevoEstado: EstadoPedido) {
    cambiarEstado.mutate(
      { id: pedido.id, estado: nuevoEstado },
      {
        onSuccess: () =>
          mostrar("exito", `Pedido #${pedido.id} → ${ETIQUETAS[nuevoEstado]}`),
        onError: (error) => mostrar("error", mensajeDeError(error)),
      },
    );
  }

  function cambiarFiltro(valor: string) {
    setEstado(valor === "" ? undefined : (valor as EstadoPedido));
    setSkip(0);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>

        <div>
          <label htmlFor="estado" className="mr-2 text-sm font-medium">
            Estado
          </label>
          <select
            id="estado"
            value={estado ?? ""}
            onChange={(evento) => cambiarFiltro(evento.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">Todos</option>
            {Object.entries(ETIQUETAS).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </div>
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
          titulo="No hay pedidos para mostrar"
          descripcion={
            estado
              ? "Probá sacando el filtro de estado."
              : "Cuando un cliente confirme un pedido, va a aparecer acá."
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <TablaPedidos
            pedidos={data.items}
            mostrarUsuario
            acciones={(pedido) => (
              <>
                <Button
                  tamanio="sm"
                  variante="secundario"
                  onClick={() => setVerDetalle(pedido)}
                >
                  Ver detalle
                </Button>
                {/* Solo se ofrecen las transiciones válidas (RN-02) */}
                {TRANSICIONES[pedido.estado].map((siguiente) => (
                  <Button
                    key={siguiente}
                    tamanio="sm"
                    variante={siguiente === "CANCELADO" ? "peligro" : "primario"}
                    disabled={cambiarEstado.isPending}
                    onClick={() => avanzar(pedido, siguiente)}
                  >
                    {ETIQUETAS[siguiente]}
                  </Button>
                ))}
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