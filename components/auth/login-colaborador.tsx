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

/**
 * Formulario del colaborador: cédula + código SAP. Pensado para celular, con
 * objetivos táctiles grandes (>= 44px). Sin registro ni recuperación.
 */
export function LoginColaborador({ accion }: { accion: Accion }) {
  const [state, formAction, pending] = useActionState(accion, { error: null });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="cedula">Número de cédula</Label>
        <Input
          id="cedula"
          name="cedula"
          inputMode="numeric"
          autoComplete="username"
          required
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="codigo_sap">Código SAP</Label>
        <Input
          id="codigo_sap"
          name="codigo_sap"
          autoComplete="current-password"
          required
          className="h-12 text-base"
        />
      </div>
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        className="h-12 w-full text-base"
        disabled={pending}
      >
        {pending && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
        Entrar
      </Button>
    </form>
  );
}
