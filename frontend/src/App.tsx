import { useEffect } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { AppRouter } from "@/routes/AppRouter";
import { useThemeStore } from "@/store/themeStore";

export default function App() {
  const { verificarSesion } = useAuth();
  const tema = useThemeStore((estado) => estado.tema);

  useEffect(() => {
    // Única llamada a la API en un useEffect: confirma la sesión al montar.
    void verificarSesion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "dark");
  }, [tema]);

  return <AppRouter />;
}
