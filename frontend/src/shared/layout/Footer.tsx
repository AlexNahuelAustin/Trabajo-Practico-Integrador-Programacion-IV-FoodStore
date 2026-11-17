export function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-amber-400 bg-violet-950 text-violet-200">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm">
        <p className="font-medium text-violet-100">Food Store</p>
        <p className="mt-1 text-violet-300">
          © {anio} Food Store · Trabajo Práctico Integrador · Programación 4
        </p>
      </div>
    </footer>
  );
}
