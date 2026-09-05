"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type EstadoAcceso = { error: string | null };
type Accion = (
  prev: EstadoAcceso,
  formData: FormData,
) => Promise<EstadoAcceso>;

/**
 * Formulario de correo + contraseña para los espacios de personal.
 * `grande`: campos y botón más grandes (operario, celular al aire libre).
 */
export function LoginCorreo({
  accion,
  grande = false,
}: {
  accion: Accion;
  grande?: boolean;
}) {
  const [state, formAction, pending] = useActionState(accion, { error: null });

  const claseInput = grande ? "h-14 text-base" : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="correo" className={grande ? "text-base" : undefined}>
          Correo
        </Label>
        <Input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          required
          className={claseInput}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className={grande ? "text-base" : undefined}>
          Contraseña
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={claseInput}
        />
      </div>
      {state?.error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        className={cn("w-full", grande && "h-14 text-lg")}
        disabled={pending}
      >
        {pending && (
          <Loader2
            className={cn("mr-2 animate-spin", grande ? "size-5" : "size-4")}
            aria-hidden
          />
        )}
        Entrar
      </Button>
    </form>
  );
}
