import { Card } from "@/shared/ui/Card";

type Color = "neutro" | "ambar" | "celeste" | "verde" | "rojo";

type Props = {
  etiqueta: string;
  valor: string | number;
  color?: Color;
};

const COLORES: Record<Color, string> = {
  neutro: "text-slate-900 dark:text-slate-100",
  ambar: "text-amber-600 dark:text-amber-400",
  celeste: "text-sky-600 dark:text-sky-400",
  verde: "text-emerald-600 dark:text-emerald-400",
  rojo: "text-red-600 dark:text-red-400",
};

export function TarjetaResumen({ etiqueta, valor, color = "neutro" }: Props) {
  return (
    <Card>
      <p className="text-sm text-slate-500 dark:text-slate-400">{etiqueta}</p>
      <p className={`mt-1 text-3xl font-bold ${COLORES[color]}`}>{valor}</p>
    </Card>
  );
}