"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Botón de salir. Recibe la server action de cierre del espacio. */
export function BotonCerrarSesion({
  accion,
  className,
  siempreTexto = false,
}: {
  accion: () => Promise<void>;
  className?: string;
  /** Muestra el texto "Salir" también en móvil (p. ej. dentro de la barra lateral). */
  siempreTexto?: boolean;
}) {
  return (
    <form action={accion}>
      {/* En móvil, solo el ícono (con etiqueta accesible) para no apretar el
          encabezado; el texto aparece desde sm (salvo siempreTexto). */}
      <Button
        variant="ghost"
        size="sm"
        type="submit"
        aria-label="Salir"
        className={className}
      >
        <LogOut className={cn("size-4", siempreTexto ? "mr-2" : "sm:mr-2")} aria-hidden />
        <span className={siempreTexto ? "inline" : "hidden sm:inline"}>Salir</span>
      </Button>
    </form>
  );
}
