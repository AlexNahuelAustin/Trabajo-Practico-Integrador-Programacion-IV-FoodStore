import { Button } from "@/shared/ui/Button";

type Props = {
  mensaje: string;
  onReintentar?: () => void;
};

export function EstadoError({ mensaje, onReintentar }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 py-12 text-center dark:border-red-900 dark:bg-red-950">
      <p className="font-medium text-red-800 dark:text-red-300">
        No se pudieron cargar los datos
      </p>
      <p className="max-w-md text-sm text-red-700 dark:text-red-400">
        {mensaje}
      </p>
      {onReintentar && (
        <Button variante="secundario" tamanio="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}