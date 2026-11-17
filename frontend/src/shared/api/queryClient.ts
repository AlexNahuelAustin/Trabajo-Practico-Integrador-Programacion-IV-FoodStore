import { QueryClient } from "@tanstack/react-query";

/** Instancia única de TanStack Query para toda la aplicación. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Un minuto sin volver a pedir los mismos datos.
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});