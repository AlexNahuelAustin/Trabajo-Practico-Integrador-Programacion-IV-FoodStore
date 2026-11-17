import type { EstadoPedido } from "@/shared/types/api";

type Props = {
  estado: EstadoPedido;
};

const ESTILOS: Record<EstadoPedido, string> = {
  PENDIENTE:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  EN_PREPARACION:
    "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  ENTREGADO:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELADO: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const TEXTOS: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function BadgeEstado({ estado }: Props) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${ESTILOS[estado]}`}
    >
      {TEXTOS[estado]}
    </span>
  );
}