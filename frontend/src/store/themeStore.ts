import { create } from "zustand";
import { persist } from "zustand/middleware";

type Tema = "light" | "dark";

type EstadoTema = {
  tema: Tema;
  alternarTema: () => void;
};

export const useThemeStore = create<EstadoTema>()(
  persist(
    (set, get) => ({
      tema: "light",
      alternarTema: () =>
        set({ tema: get().tema === "light" ? "dark" : "light" }),
    }),
    {
      name: "theme-storage",
      partialize: (estado) => ({ tema: estado.tema }),
    },
  ),
);