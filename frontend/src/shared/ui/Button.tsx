import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";
type Tamanio = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamanio?: Tamanio;
  children: ReactNode;
};

const VARIANTES: Record<Variante, string> = {
  primario:
    "bg-amber-400 text-violet-950 hover:bg-amber-300 focus-visible:outline-amber-500",
  secundario:
    "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800",
  peligro:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  fantasma:
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
};

const TAMANIOS: Record<Tamanio, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variante = "primario",
  tamanio = "md",
  className = "",
  children,
  ...resto
}: Props) {
  return (
    <button
      {...resto}
      className={`cursor-pointer rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANIOS[tamanio]} ${className}`}
    >
      {children}
    </button>
  );
}