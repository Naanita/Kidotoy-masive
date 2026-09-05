"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Descargar el comprobante = imprimir (el navegador ofrece "Guardar como PDF").
 * La hoja de impresión (print:hidden en la chrome) deja solo el boleto, el
 * resumen y el evento, en blanco y negro de alto contraste.
 */
export function BotonDescargar({ className }: { className?: string }) {
  return (
    <Button
      className={className}
      onClick={() => window.print()}
      type="button"
    >
      <Download className="mr-2 size-4" aria-hidden />
      Descargar comprobante
    </Button>
  );
}
