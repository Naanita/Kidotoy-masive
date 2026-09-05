import { ImageIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Marcador de "aquí va una imagen". Mientras no haya foto real de un juguete (o
 * en maquetas), se muestra este preview con degradado de colores Kidotoy y un
 * ícono, en vez de un recuadro gris genérico o un placeholder externo. Deja claro
 * que el espacio es para una imagen y mantiene el tono divertido de marca.
 */
export function PreviewImagen({
  etiqueta,
  icon: Icon = ImageIcon,
  className,
}: {
  etiqueta?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={etiqueta ?? "Imagen del juguete"}
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-kido-turquesa/20 via-kido-amarillo/10 to-kido-morado/20",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-1.5 px-2 text-center">
        <Icon className="size-8 text-kido-turquesa/80" aria-hidden />
        {etiqueta && (
          <span className="text-xs font-medium text-foreground/60">
            {etiqueta}
          </span>
        )}
      </div>
    </div>
  );
}
