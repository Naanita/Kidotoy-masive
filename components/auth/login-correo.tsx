"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type EstadoAcceso = { error: string | null };
type Accion = (
  prev: EstadoAcceso,
  formData: FormData,
) => Promise<EstadoAcceso>;

/** Formulario de correo + contraseña para los espacios de personal. */
export function LoginCorreo({ accion }: { accion: Accion }) {
  const [state, formAction, pending] = useActionState(accion, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="correo">Correo</Label>
        <Input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
        Entrar
      </Button>
    </form>
  );
}
