import { useState } from "react";

import { CategoriaForm } from "@/features/categorias/components/CategoriaForm";
import { TablaCategorias } from "@/features/categorias/components/TablaCategorias";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "@/features/categorias/hooks/useCategorias";
import type { Categoria, CategoriaCreate } from "@/features/categorias/types";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { useNotificationStore } from "@/store/notificationStore";

export function AdminCategoriasPage() {
  const { data: categorias, isPending, isError, error, refetch } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();
  const mostrar = useNotificationStore((estado) => estado.mostrar);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState<Categoria | null>(null);

  function abrirCreacion() {
    setEnEdicion(null);
    setModalAbierto(true);
  }

  function abrirEdicion(categoria: Categoria) {
    setEnEdicion(categoria);
    setModalAbierto(true);
  }

  function cerrar() {
    setModalAbierto(false);
    setEnEdicion(null);
  }

  function guardar(datos: CategoriaCreate) {
    if (enEdicion) {
      actualizar.mutate(
        { id: enEdicion.id, datos },
        {
          onSuccess: () => {
            mostrar("exito", "Categoría actualizada");
            cerrar();
          },
          onError: (error) => mostrar("error", mensajeDeError(error)),
        },
      );
      return;
    }

    crear.mutate(datos, {
      onSuccess: () => {
        mostrar("exito", "Categoría creada");
        cerrar();
      },
      onError: (error) => mostrar("error", mensajeDeError(error)),
    });
  }

  function darDeBaja(categoria: Categoria) {
    const confirmado = window.confirm(
      `¿Dar de baja la categoría "${categoria.nombre}"? Sus productos siguen existiendo.`,
    );
    if (!confirmado) return;

    eliminar.mutate(categoria.id, {
      onSuccess: () => mostrar("exito", "Categoría dada de baja"),
      onError: (error) => mostrar("error", mensajeDeError(error)),
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={abrirCreacion}>Nueva categoría</Button>
      </div>

      {isPending && <SkeletonFilas cantidad={5} />}

      {isError && (
        <EstadoError
          mensaje={mensajeDeError(error)}
          onReintentar={() => void refetch()}
        />
      )}

      {categorias && categorias.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hay categorías"
          descripcion="Creá la primera para poder cargar productos."
          accion={<Button onClick={abrirCreacion}>Nueva categoría</Button>}
        />
      )}

      {categorias && categorias.length > 0 && (
        <TablaCategorias
          categorias={categorias}
          onEditar={abrirEdicion}
          onEliminar={darDeBaja}
        />
      )}

      <Modal
        abierto={modalAbierto}
        titulo={enEdicion ? "Editar categoría" : "Nueva categoría"}
        onCerrar={cerrar}
      >
        <CategoriaForm
          // El key fuerza el remontaje: así el formulario toma los valores
          // nuevos sin necesidad de un useEffect con setState (React 19).
          key={enEdicion?.id ?? "nueva"}
          categoria={enEdicion ?? undefined}
          guardando={crear.isPending || actualizar.isPending}
          onGuardar={guardar}
          onCancelar={cerrar}
        />
      </Modal>
    </div>
  );
}