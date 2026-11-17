import type { Rol, Usuario } from "@/features/auth/types";

// Los usuarios son los mismos que maneja auth: se reexportan para que
// la feature tenga su propio punto de entrada de tipos.
export type { Rol, Usuario };