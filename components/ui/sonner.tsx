"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";
import { CheckCircle2, TriangleAlert, XCircle, Info } from "lucide-react";

/**
 * Notificaciones flotantes (DESIGN §4): fondo blanco, sombra media, borde
 * izquierdo de color semántico, ícono, apilables, autocierre ~4.5 s.
 * Posición: arriba a la derecha en escritorio, arriba centradas en móvil.
 * Los errores de formulario NUNCA van aquí; van pegados al campo.
 */
export function Toaster() {
  const [pos, setPos] = useState<"top-center" | "top-right">("top-center");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const actualizar = () => setPos(mq.matches ? "top-right" : "top-center");
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);

  return (
    <Sonner
      position={pos}
      duration={4500}
      gap={8}
      icons={{
        success: <CheckCircle2 className="size-5 text-success" aria-hidden />,
        error: <XCircle className="size-5 text-destructive" aria-hidden />,
        warning: <TriangleAlert className="size-5 text-warning" aria-hidden />,
        info: <Info className="size-5 text-primary" aria-hidden />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group flex w-full items-center gap-3 rounded-md border border-border border-l-4 bg-card px-4 py-3 text-card-foreground shadow-lg",
          title: "font-heading text-sm font-semibold text-foreground",
          description: "text-sm text-muted-foreground",
          success: "!border-l-success",
          error: "!border-l-destructive",
          warning: "!border-l-warning",
          info: "!border-l-primary",
          closeButton: "text-muted-foreground",
        },
      }}
    />
  );
}
