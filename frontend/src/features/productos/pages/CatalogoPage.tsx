import { useState } from "react";

import { FiltrosCatalogo } from "@/features/productos/components/FiltrosCatalogo";
import { ProductoCard } from "@/features/productos/components/ProductoCard";
import { useProductos } from "@/features/productos/hooks/useProductos";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonTarjetas } from "@/shared/components/Skeleton";

const POR_PAGINA = 12;

export function CatalogoPage() {
  const [skip, setSkip] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useProductos({
      skip,
      limit: POR_PAGINA,
      search: busqueda,
      categoria_id: categoriaId,
    });

  // Al cambiar un filtro se vuelve a la primera página.
  function cambiarBusqueda(valor: string) {
    setBusqueda(valor);
    setSkip(0);
  }

  function cambiarCategoria(valor: number | undefined) {
    setCategoriaId(valor);
    setSkip(0);
  }

  const hayFiltros = busqueda.trim() !== "" || categoriaId !== undefined;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Catálogo</h1>

      <FiltrosCatalogo
        busqueda={busqueda}
        categoriaId={categoriaId}
        onCambiarBusqueda={cambiarBusqueda}
        onCambiarCategoria={cambiarCategoria}
      />

      {isPending && <SkeletonTarjetas cantidad={POR_PAGINA} />}

      {isError && (
        <EstadoError
          mensaje={mensajeDeError(error)}
          onReintentar={() => void refetch()}
        />
      )}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo={
            hayFiltros
              ? "No encontramos productos con esos filtros"
              : "Todavía no hay productos cargados"
          }
          descripcion={
            hayFiltros
              ? "Probá con otra búsqueda o sacá el filtro de categoría."
              : "Volvé en un rato, estamos preparando el menú."
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div
            className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
              // Mientras llega la página nueva, la anterior se ve atenuada.
              isPlaceholderData ? "opacity-60" : ""
            }`}
          >
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          <Paginacion
            total={data.total}
            skip={skip}
            limit={POR_PAGINA}
            onCambiarSkip={setSkip}
          />
        </>
      )}
    </div>
  );
}