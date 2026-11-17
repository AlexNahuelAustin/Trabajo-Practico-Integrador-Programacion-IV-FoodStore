import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold">No tenés permiso para ver esto</h1>
      <p className="max-w-md text-slate-600 dark:text-slate-300">
        Esta sección es solo para administradores.
      </p>
      <Link
        to="/"
        className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-violet-950 transition hover:bg-amber-300"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
