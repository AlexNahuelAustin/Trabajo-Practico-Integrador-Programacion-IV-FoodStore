import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import { registrarManejadorDeSesion } from "@/shared/api/axiosInstance";
import { queryClient } from "@/shared/api/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

// El interceptor avisa que la sesión cayó; acá se decide qué hacer.
registrarManejadorDeSesion((mensaje) => {
  useAuthStore.getState().limpiarSesion();
  useNotificationStore.getState().mostrar("error", mensaje);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);