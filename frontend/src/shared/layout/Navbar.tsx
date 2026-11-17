import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";

const BASE =
  "rounded-md px-3 py-2 text-sm font-medium text-violet-100 transition hover:bg-white/10 hover:text-white";
const ACTIVO = "bg-white/15 text-white";

function clases({ isActive }: { isActive: boolean }) {
  return isActive ? `${BASE} ${ACTIVO}` : BASE;
}

export function Navbar() {
  const usuario = useAuthStore((estado) => estado.usuario);
  const cerrarSesion = useAuthStore((estado) => estado.cerrarSesion);
  const items = useCartStore((estado) => estado.items);
  const tema = useThemeStore((estado) => estado.tema);
  const alternarTema = useThemeStore((estado) => estado.alternarTema);
  const navegar = useNavigate();

  const esAdmin = usuario?.role === "admin";
  const cantidad = items.reduce((suma, item) => suma + item.cantidad, 0);

  async function salir() {
    await cerrarSesion();
    navegar("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 bg-violet-700 shadow-md dark:bg-violet-950">
      {/*
        Sin max-w-7xl/mx-auto a propósito: ocupa TODO el ancho del header,
        así el logo y las acciones quedan pegados a los bordes reales de la
        pantalla y no a los de una caja centrada de 1280px.
      */}
      <div className="w-full px-4 py-2">
        {/* Fila superior: logo a la izquierda, usuario en el centro,
            modo oscuro + sesión a la derecha. */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            to="/"
            className="flex w-fit shrink-0 items-center justify-self-start"
            aria-label="Food Store - Inicio"
          >
            <img
              src="/Logo%20FoodStore.png"
              alt="Food Store"
              className="logo-brillo h-20 w-auto object-contain"
            />
          </Link>

          <div className="justify-self-center">
            {usuario && (
              <span className="hidden items-center gap-2 text-sm text-violet-100 sm:flex">
                {usuario.full_name}
                <span className="rounded bg-amber-400 px-1.5 py-0.5 text-xs font-bold uppercase text-violet-950">
                  {usuario.role}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-self-end gap-2">
            <button
              type="button"
              onClick={alternarTema}
              aria-label="Cambiar tema"
              title={tema === "light" ? "Modo oscuro" : "Modo claro"}
              className="cursor-pointer rounded-md px-3 py-2 text-sm transition hover:bg-white/10"
            >
              {tema === "light" ? "🌙" : "☀️"}
            </button>

            {usuario ? (
              <button
                type="button"
                onClick={() => void salir()}
                className="cursor-pointer rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-violet-950 transition hover:bg-amber-300"
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <NavLink to="/login" className={clases}>
                  Ingresar
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-violet-950 transition hover:bg-amber-300"
                >
                  Crear cuenta
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Fila inferior: toda la navegación, centrada. */}
        <nav className="mt-1 flex flex-wrap items-center justify-center gap-1">
          <NavLink to="/" end className={clases}>
            Catálogo
          </NavLink>

          {usuario && (
            <NavLink to="/mis-pedidos" className={clases}>
              Mis pedidos
            </NavLink>
          )}

          {esAdmin && (
            <>
              <NavLink to="/admin/resumen" className={clases}>
                Resumen
              </NavLink>
              <NavLink to="/admin/categorias" className={clases}>
                Categorías
              </NavLink>
              <NavLink to="/admin/productos" className={clases}>
                Productos
              </NavLink>
              <NavLink to="/admin/pedidos" className={clases}>
                Pedidos
              </NavLink>
              <NavLink to="/admin/usuarios" className={clases}>
                Usuarios
              </NavLink>
            </>
          )}

          <NavLink to="/carrito" className={clases}>
            Carrito
            {cantidad > 0 && (
              <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-violet-950">
                {cantidad}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
