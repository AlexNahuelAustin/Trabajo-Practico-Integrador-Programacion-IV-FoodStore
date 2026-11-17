import { useForm } from "@tanstack/react-form";

import type { FormaPago } from "@/features/pedidos/types";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formulario";

export type DatosCheckout = {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string | null;
};

type Props = {
  enviando: boolean;
  onConfirmar: (datos: DatosCheckout) => void;
};

const CLASE_CONTROL =
  "w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-amber-500 dark:border-slate-600 dark:bg-slate-800";

export function CheckoutForm({ enviando, onConfirmar }: Props) {
  const formulario = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: ({ value }) => {
      onConfirmar({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
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
      <formulario.Field
        name="direccion_entrega"
        validators={{
          // Mismas cotas que el schema PedidoCreate del backend (RN-06).
          onChange: ({ value }) => {
            const limpio = value.trim();
            if (limpio.length < 5)
              return "La dirección debe tener al menos 5 caracteres";
            if (limpio.length > 200)
              return "La dirección no puede superar los 200 caracteres";
            return undefined;
          },
        }}
      >
        {(campo) => (
          <Input
            label="Dirección de entrega"
            name={campo.name}
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
            error={primerError(campo.state.meta.errors)}
            placeholder="Calle, número, piso, localidad"
            autoFocus
          />
        )}
      </formulario.Field>

      <formulario.Field name="forma_pago">
        {(campo) => (
          <div>
            <label
              htmlFor={campo.name}
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Forma de pago
            </label>
            <select
              id={campo.name}
              name={campo.name}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) =>
                campo.handleChange(evento.target.value as FormaPago)
              }
              className={CLASE_CONTROL}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
        )}
      </formulario.Field>

      <formulario.Field name="notas">
        {(campo) => (
          <div>
            <label
              htmlFor={campo.name}
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Notas (opcional)
            </label>
            <textarea
              id={campo.name}
              name={campo.name}
              rows={3}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              placeholder="Tocar timbre, sin cebolla, etc."
              className={CLASE_CONTROL}
            />
          </div>
        )}
      </formulario.Field>

      <formulario.Subscribe
        selector={(estado) => [estado.canSubmit, estado.isSubmitting] as const}
      >
        {([puedeEnviar]) => (
          <Button
            type="submit"
            disabled={!puedeEnviar || enviando}
            className="w-full"
          >
            {enviando ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        )}
      </formulario.Subscribe>
    </form>
  );
}