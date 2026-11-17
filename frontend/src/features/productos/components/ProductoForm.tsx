import { useForm } from "@tanstack/react-form";

import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import type { Producto, ProductoCreate } from "@/features/productos/types";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formulario";

type Props = {
  /** Si viene, edita; si no, crea. */
  producto?: Producto;
  guardando: boolean;
  onGuardar: (datos: ProductoCreate) => void;
  onCancelar: () => void;
};

const CLASE_CONTROL =
  "w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-amber-500 dark:border-slate-600 dark:bg-slate-800";

export function ProductoForm({
  producto,
  guardando,
  onGuardar,
  onCancelar,
}: Props) {
  const { data: categorias } = useCategorias();

  const formulario = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto ? String(producto.precio_base) : "",
      imagen_url: producto?.imagen_url ?? "",
      stock: producto ? String(producto.stock) : "0",
      categoria_id: producto ? String(producto.categoria_id) : "",
    },
    onSubmit: ({ value }) => {
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        categoria_id: Number(value.categoria_id),
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
          onChange: ({ value }) =>
            value.trim().length < 2 ? "El nombre es obligatorio" : undefined,
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
              className={CLASE_CONTROL}
            />
          </div>
        )}
      </formulario.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <formulario.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => {
              const numero = Number(value);
              if (value.trim() === "" || Number.isNaN(numero))
                return "Ingresá un número";
              if (numero < 0) return "El precio no puede ser negativo";
              return undefined;
            },
          }}
        >
          {(campo) => (
            <Input
              label="Precio"
              name={campo.name}
              type="number"
              min={0}
              step="0.01"
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              error={primerError(campo.state.meta.errors)}
            />
          )}
        </formulario.Field>

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
            />
          )}
        </formulario.Field>
      </div>

      <formulario.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) =>
            value === "" ? "Elegí una categoría" : undefined,
        }}
      >
        {(campo) => (
          <div>
            <label
              htmlFor={campo.name}
              className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Categoría
            </label>
            <select
              id={campo.name}
              name={campo.name}
              value={campo.state.value}
              onBlur={campo.handleBlur}
              onChange={(evento) => campo.handleChange(evento.target.value)}
              className={CLASE_CONTROL}
            >
              <option value="">Elegir...</option>
              {categorias?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {primerError(campo.state.meta.errors) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {primerError(campo.state.meta.errors)}
              </p>
            )}
          </div>
        )}
      </formulario.Field>

      <formulario.Field name="imagen_url">
        {(campo) => (
          <Input
            label="URL de la imagen (opcional)"
            name={campo.name}
            type="url"
            placeholder="https://..."
            value={campo.state.value}
            onBlur={campo.handleBlur}
            onChange={(evento) => campo.handleChange(evento.target.value)}
          />
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