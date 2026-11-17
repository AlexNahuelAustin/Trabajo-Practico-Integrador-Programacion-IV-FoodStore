import { useForm } from "@tanstack/react-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { mensajeDeError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { primerError } from "@/shared/utils/formulario";
import { useNotificationStore } from "@/store/notificationStore";

type EstadoNavegacion = { desde?: string } | null;

export function LoginPage() {
  const { iniciarSesion, cargando } = useAuth();
  const mostrar = useNotificationStore((estado) => estado.mostrar);
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const desde = (ubicacion.state as EstadoNavegacion)?.desde ?? "/";

  const formulario = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      try {
        await iniciarSesion(value);
        navegar(desde, { replace: true });
      } catch (error) {
        mostrar(
          "error",
          mensajeDeError(error, "Usuario o contraseña incorrectos"),
        );
      }
    },
  });

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="mb-6 text-center text-2xl font-bold">Ingresar</h1>
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
                value.trim() === "" ? "Ingresá tu usuario" : undefined,
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
            name="password"
            validators={{
              onChange: ({ value }) =>
                value === "" ? "Ingresá tu contraseña" : undefined,
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
                {cargando ? "Ingresando..." : "Ingresar"}
              </Button>
            )}
          </formulario.Subscribe>
        </form>
      </Card>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿No tenés cuenta?{" "}
        <Link
          to="/register"
          className="font-medium text-amber-600 hover:underline"
        >
          Creá una
        </Link>
      </p>
    </div>
  );
}
