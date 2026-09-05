import { cn } from "@/lib/utils";
import { ESTADO_VISUAL, type TipoEstado } from "@/components/estado/config-estado";

/**
 * EL GESTO del sistema: una cápsula corta de extremos redondeados en el color del
 * ESTADO. Se repite —misma forma, distintas escalas— en el chip, en el riel de
 * alertas y toasts, en el tramo activo del stepper y como lomo de las tarjetas.
 * Eso hace que login, catálogo, paneles y entrega se lean como una sola familia.
 *
 * El anillo interno `ring-foreground/10` da definición a los colores claros
 * (el amarillo de Kidotoy sobre blanco es el caso débil) sin ensuciar los vivos.
 * Es un token del tema, no un valor a mano.
 */
export function BarraEstado({
  tipo,
  horizontal = false,
  className,
}: {
  tipo: TipoEstado;
  horizontal?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "block shrink-0 rounded-full ring-1 ring-inset ring-foreground/10",
        horizontal ? "h-1 w-full" : "w-1",
        ESTADO_VISUAL[tipo].barra,
        className,
      )}
    />
  );
}
