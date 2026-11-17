import { useForm } from "@tanstack/react-form";

import type {
  Producto,
  ProductoStockUpdate,
} from "@/features/productos/types";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formulario";

type Props = {
  producto: Producto;
  guardando: boolean;
  onGuardar: (datos: ProductoStockUpdate) => void;
  onCancelar: () => void;
};

export function StockForm({
  producto,
  guardando,
  onGuardar,
  onCancelar,
}: Props) {
  const formulario = useForm({
    defaultValues: {
      stock: String(producto.stock),
      disponible: producto.disponible,
    },
    onSubmit: ({ value }) => {
      onGuardar({
        stock: Number(value.stock),
        disponible: value.disponible,
      });
    },
  });

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault();
        evento.stopPropagation();
        void formulario.handleSubmit();
      }}
      className="space-y-4"
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {producto.nombre}
      </p>

      <formulario.Field
        name="stock"
        validators={{
          onChange: ({ value }) => {
            const numero = Number(value);
            if (value.trim() === "" || !Number.isInteger(numero))
              return "Ingresá un número entero";
            if (numero < 0) return "El stock no puede ser negativo";
            return undefined;
          },
        }}
      >
        {(campo) => (
          <Input
            label="Stock"
            name={campo.name}
            type="number"
            min={0}
            step="1"
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
            error={primerError(campo.state.meta.errors)}
            autoFocus
          />
        )}
      </formulario.Field>

      <formulario.Field name="disponible">
        {(campo) => (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={campo.name}
              checked={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.checked)}
              className="h-4 w-4 cursor-pointer accent-amber-600"
            />
            Disponible para la venta
          </label>
        )}
      </formulario.Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <formulario.Subscribe selector={(estado) => estado.canSubmit}>
          {(puedeEnviar) => (
            <Button type="submit" disabled={!puedeEnviar || guardando}>
              {guardando ? "Guardando..." : "Actualizar stock"}
            </Button>
          )}
        </formulario.Subscribe>
      </div>
    </form>
  );
}