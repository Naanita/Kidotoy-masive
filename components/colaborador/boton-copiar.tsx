"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificar } from "@/lib/notificar";

/**
 * Copia el código de entrega REAL (sin espacios) al portapapeles y confirma con
 * un toast "Código copiado". Copiar el código crudo asegura que al pegarlo en el
 * módulo de entrega la búsqueda funcione tal cual.
 */
export function BotonCopiarCodigo({
  codigo,
  className,
}: {
  codigo: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      notificar.exito("Código copiado", codigo);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      notificar.error("No se pudo copiar", "Cópialo a mano, por favor.");
    }
  }

  return (
    <Button variant="outline" onClick={copiar} className={className}>
      {copiado ? (
        <Check className="mr-2 size-4" aria-hidden />
      ) : (
        <Copy className="mr-2 size-4" aria-hidden />
      )}
      {copiado ? "Copiado" : "Copiar código"}
    </Button>
  );
}
