import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Estado vacío: cuando una lista o pantalla no tiene datos todavía. No es un
 * error; explica qué falta y, si aplica, ofrece la acción para poblarlo. Borde
 * punteado suave (superficie en espera), ícono en turquesa Kidotoy dentro de un
 * disco tenue del mismo color: hasta el vacío tiene el tono alegre de marca.
 */
export function EstadoVacio({
  icon: Icon,
  titulo,
  descripcion,
  children,
  className,
}: {
  icon: LucideIcon;
  titulo: string;
  descripcion?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-kido-turquesa/15 text-kido-turquesa">
        <Icon className="size-7" aria-hidden />
      </span>
      <h3 className="font-heading text-base font-semibold text-foreground">
        {titulo}
      </h3>
      {descripcion && (
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {descripcion}
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
