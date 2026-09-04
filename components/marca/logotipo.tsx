import { cn } from "@/lib/utils";

/**
 * Logotipos oficiales (PNG con fondo transparente, colores fijos de marca).
 *
 * FUENTE ÚNICA: para cambiar un archivo (p. ej. al llegar los vectoriales SVG),
 * se edita SOLO este objeto; nada más en la app hay que tocar.
 *
 * - `srcDark`: variante para fondo oscuro. Hoy apunta al mismo archivo; cuando
 *   se tenga una versión clara del logo para oscuro, se cambia aquí.
 * - `alto`/`ancho`: dimensiones intrínsecas, para reservar espacio (sin layout
 *   shift) y calcular el aspecto.
 * - `maxAlto`: el de Acueducto viene en baja resolución (500×124); se limita su
 *   altura para que nunca se vea pixelado. Quitar el tope al llegar el vectorial.
 */
const LOGOS = {
  kidotoy: {
    src: "/logos/kidotoy.png",
    srcDark: "/logos/kidotoy.png",
    ancho: 1469,
    alto: 539,
    alt: "Kidotoy",
    maxAlto: undefined as string | undefined,
  },
  acueducto: {
    src: "/logos/acueducto.png",
    srcDark: "/logos/acueducto.png",
    ancho: 500,
    alto: 124,
    alt: "Acueducto · Agua y Alcantarillado de Bogotá",
    maxAlto: "max-h-9", // baja resolución: no crecer más allá de ~36px de alto
  },
} as const;

type Marca = keyof typeof LOGOS;

/**
 * Un logo. `alturaClase` controla el tamaño (h-*). Renderiza la variante clara
 * y la oscura; la oscura solo se ve bajo `.dark` (hoy es el mismo archivo).
 */
function Logo({
  marca,
  alturaClase,
  className,
}: {
  marca: Marca;
  alturaClase: string;
  className?: string;
}) {
  const l = LOGOS[marca];
  const comun = cn("w-auto object-contain", alturaClase, l.maxAlto);
  return (
    <span className={cn("inline-flex", className)}>
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src={l.src}
        width={l.ancho}
        height={l.alto}
        alt={l.alt}
        className={cn(comun, "dark:hidden")}
      />
      <img
        src={l.srcDark}
        width={l.ancho}
        height={l.alto}
        alt=""
        aria-hidden
        className={cn(comun, "hidden dark:block")}
      />
      {/* eslint-enable @next/next/no-img-element */}
    </span>
  );
}

/** Solo el logo de Kidotoy (para el panel de administración). */
export function MarcaKidotoy({ className }: { className?: string }) {
  return <Logo marca="kidotoy" alturaClase="h-7" className={className} />;
}

/**
 * Lockup co-marca: acueducto | kidotoy, con un separador discreto.
 * Para el login y el encabezado del espacio del colaborador.
 */
export function LockupMarca({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Logo marca="acueducto" alturaClase="h-7" />
      <span aria-hidden className="h-7 w-px bg-border" />
      <Logo marca="kidotoy" alturaClase="h-7" />
    </span>
  );
}
