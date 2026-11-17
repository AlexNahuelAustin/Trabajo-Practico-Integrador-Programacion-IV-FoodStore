import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formulario";
import { useNotificationStore } from "@/store/notificationStore";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const { registrarse, cargando } = useAuth();
  const mostrar = useNotificationStore((estado) => estado.mostrar);
  const navegar = useNavigate();

  const formulario = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      try {
        await registrarse(value);
        mostrar("exito", "Cuenta creada");
        navegar("/", { replace: true });
      } catch (error) {
        mostrar("error", mensajeDeError(error));
      }
    },
  });

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-6 text-center text-2xl font-bold">Crear cuenta</h1>
      <Card>
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            evento.stopPropagation();
            void formulario.handleSubmit();
          }}
          className="space-y-4"
        >
          <formulario.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ? "Ingresá un usuario" : undefined,
            }}
          >
            {(campo) => (
              <Input
                label="Usuario"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={primerError(campo.state.meta.errors)}
                autoFocus
              />
            )}
          </formulario.Field>

          <formulario.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ? "Ingresá tu nombre" : undefined,
            }}
          >
            {(campo) => (
              <Input
                label="Nombre completo"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={primerError(campo.state.meta.errors)}
              />
            )}
          </formulario.Field>

          <formulario.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                REGEX_EMAIL.test(value) ? undefined : "Ingresá un email válido",
            }}
          >
            {(campo) => (
              <Input
                label="Email"
                type="email"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={primerError(campo.state.meta.errors)}
              />
            )}
          </formulario.Field>

          <formulario.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8
                  ? "La contraseña debe tener al menos 8 caracteres"
                  : undefined,
            }}
          >
            {(campo) => (
              <Input
                label="Contraseña"
                type="password"
                name={campo.name}
                value={campo.state.value}
                onBlur={campo.handleBlur}
                onChange={(evento) => campo.handleChange(evento.target.value)}
                error={primerError(campo.state.meta.errors)}
              />
            )}
          </formulario.Field>

          <formulario.Subscribe selector={(estado) => estado.canSubmit}>
            {(puedeEnviar) => (
              <Button
                type="submit"
                disabled={!puedeEnviar || cargando}
                className="w-full"
              >
                {cargando ? "Creando..." : "Crear cuenta"}
              </Button>
            )}
          </formulario.Subscribe>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿Ya tenés cuenta?{" "}
        <Link
          to="/login"
          className="font-medium text-amber-600 hover:underline"
        >
          Ingresá
        </Link>
      </p>
    </div>
  );
}
