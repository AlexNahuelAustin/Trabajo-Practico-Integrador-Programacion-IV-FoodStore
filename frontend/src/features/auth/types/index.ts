export type Rol = "user" | "admin";

/** Espejo de UserPublic: nunca incluye hashed_password. */
export type Usuario = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
};

export type CredencialesLogin = {
  username: string;
  password: string;
};

/** Cuerpo de POST /auth/register. El registro público crea rol "user". */
export type DatosRegistro = {
  username: string;
  full_name: string;
  email: string;
  password: string;
};
