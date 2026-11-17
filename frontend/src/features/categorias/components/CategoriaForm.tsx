import { useForm } from "@tanstack/react-form";

import type { Categoria, CategoriaCreate } from "@/features/categorias/types";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formulario";

type Props = {
  /** Si viene, el formulario edita; si no, crea. */
  categoria?: Categoria;
  guardando: boolean;
  onGuardar: (datos: CategoriaCreate) => void;
  onCancelar: () => void;
};

export function CategoriaForm({
  categoria,
  guardando,
  onGuardar,
  onCancelar,
}: Props) {
  const formulario = useForm({
    // Se inicializa desde las props; el remontaje lo fuerza la página con key.
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    },
    onSubmit: ({ value }) => {
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
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
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const limpio = value.trim();
            if (limpio.length < 2) return "El nombre debe tener al menos 2 caracteres";
            if (limpio.length > 100) return "El nombre no puede superar los 100 caracteres";
            return undefined;
          },
        }}
      >
        {(campo) => (
          <Input
            label="Nombre"
            name={campo.name}
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
            error={primerError(campo.state.meta.errors)}
            autoFocus
          />
        )}
      </formulario.Field>

      <formulario.Field name="descripcion">
        {(campo) => (
          <div>
            <label
              htmlFor={campo.name}
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Descripción
            </label>
            <textarea
              id={campo.name}
              name={campo.name}
              rows={3}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-amber-500 dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
        )}
      </formulario.Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <formulario.Subscribe selector={(estado) => estado.canSubmit}>
          {(puedeEnviar) => (
            <Button type="submit" disabled={!puedeEnviar || guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </Button>
          )}
        </formulario.Subscribe>
      </div>
    </form>
  );
}