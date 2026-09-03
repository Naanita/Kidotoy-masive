import { TriangleAlert } from "lucide-react";

/**
 * Banner de "versión de demostración". Su visibilidad la controla
 * empresas.banner_demo (columna en BD, editable desde /dev/parametros).
 * El layout raíz decide si renderizarlo; este componente solo lo pinta.
 *
 * Usa los tokens de estado (warning), nunca colores a mano.
 */
export function BannerDemostracion() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning px-4 py-1.5 text-center text-sm font-medium text-warning-foreground"
    >
      <TriangleAlert className="size-4 shrink-0" aria-hidden />
      <span>
        Versión de demostración · datos ficticios, sin información real
      </span>
    </div>
  );
}
