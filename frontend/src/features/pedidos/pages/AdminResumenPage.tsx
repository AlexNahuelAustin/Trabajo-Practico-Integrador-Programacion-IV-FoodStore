import { TarjetaResumen } from "@/features/pedidos/components/TarjetaResumen";
import { useResumenPedidos } from "@/features/pedidos/hooks/usePedidos";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { Skeleton } from "@/shared/components/Skeleton";
import { formatearPrecio } from "@/shared/utils/formatear";

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Resumen del negocio</h1>

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton cantidad={6} className="h-28 w-full" />
        </div>
      )}

      {isError && (
        <EstadoError
          mensaje={mensajeDeError(error)}
          onReintentar={() => void refetch()}
        />
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen
            etiqueta="Pendientes"
            valor={data.pendientes}
            color="ambar"
          />
          <TarjetaResumen
            etiqueta="En preparación"
            valor={data.en_preparacion}
            color="celeste"
          />
          <TarjetaResumen
            etiqueta="Entregados"
            valor={data.entregados}
            color="verde"
          />
          <TarjetaResumen
            etiqueta="Cancelados"
            valor={data.cancelados}
            color="rojo"
          />
          <TarjetaResumen etiqueta="Pedidos de hoy" valor={data.pedidos_hoy} />
          <TarjetaResumen
            etiqueta="Ingresos por entregados"
            valor={formatearPrecio(data.ingresos_entregados)}
            color="verde"
          />
        </div>
      )}
    </div>
  );
}