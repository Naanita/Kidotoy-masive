"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Botón de salir. Recibe la server action de cierre del espacio. */
export function BotonCerrarSesion({
  accion,
}: {
  accion: () => Promise<void>;
}) {
  return (
    <form action={accion}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="mr-2 size-4" aria-hidden />
        Salir
      </Button>
    </form>
  );
}
