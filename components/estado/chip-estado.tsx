import { cn } from "@/lib/utils";
import { BarraEstado } from "@/components/estado/barra-estado";
import { ESTADO_VISUAL, type TipoEstado } from "@/components/estado/config-estado";

export type { TipoEstado };

/**
 * Chip de estado. Píldora con fondo tenue del color y, como tope izquierdo, la
 * barra del gesto (misma cápsula que alertas, toasts y stepper). El estado nunca
 * se comunica solo con color: siempre lleva ícono + texto. Colores por tokens.
 *
 * `solido`: fondo opaco (blanco) en vez de tinte, para cuando el chip flota sobre
 * una imagen y un tinte translúcido no se leería. El color sigue en texto y barra.
 */
export function ChipEstado({
  tipo,
  children,
  solido = false,
  className,
}: {
  tipo: TipoEstado;
  children?: React.ReactNode;
  solido?: boolean;
  className?: string;
}) {
  const e = ESTADO_VISUAL[tipo];
  const Icon = e.icon;
  return (
    <span
      className={cn(
        // Texto OSCURO (legible): verde/amarillo/rojo como texto sobre blanco no
        // cumplen contraste AA. El color del estado vive en la barra, el ícono y
        // el tinte de fondo, no en el texto.
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full py-1 pl-1.5 pr-3 text-xs font-semibold text-foreground",
        solido ? "bg-card/95 shadow-sm backdrop-blur-sm" : e.chipBg,
        className,
      )}
    >
      <BarraEstado tipo={tipo} className="self-stretch" />
      <Icon className={cn("size-3.5", e.texto)} aria-hidden />
      {children ?? e.label}
    </span>
  );
}
