import { cn } from "@/lib/utils";

/**
 * Firma de marca Kidotoy: la franja de cuatro colores (turquesa · rojo · amarillo
 * · morado) que en el manual corre al pie de todas las páginas. Es identidad, no
 * estado: un device de marca, como el logo. Va al pie de logins/encabezados y en
 * remates de sección. Colores fijos del manual (tokens `--kido-*`).
 */
export function FranjaMarca({
  className,
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex overflow-hidden",
        vertical ? "h-full w-1.5 flex-col" : "h-1.5 w-full",
        className,
      )}
    >
      <span className="flex-1 bg-kido-turquesa" />
      <span className="flex-1 bg-kido-rojo" />
      <span className="flex-1 bg-kido-amarillo" />
      <span className="flex-1 bg-kido-morado" />
    </div>
  );
}
