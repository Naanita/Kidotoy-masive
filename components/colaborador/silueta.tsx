import { readFileSync } from "node:fs";
import path from "node:path";
import { cn } from "@/lib/utils";

/**
 * Silueta ilustrada del beneficiario, de fondo en su tarjeta. Nunca es la foto
 * de un menor: es un dibujo plano.
 *
 * Se INCRUSTA el SVG en el HTML en vez de usar `<img>` o un filtro, porque los
 * archivos vienen con `fill="currentColor"`: incrustados heredan el color del
 * contenedor, así que la tarjeta los tiñe con `text-kido-*-claro` —un tono más
 * claro de su propio color— y el mismo archivo sirve para las tres tarjetas.
 *
 * Se le quita el manifiesto C2PA al incrustar: son ~8 KB de base64 por archivo
 * que se repetirían en cada tarjeta del HTML. El archivo en disco queda intacto.
 *
 * `preserveAspectRatio="xMinYMax"` la ancla abajo a la izquierda: así la parte
 * que se sale de la tarjeta es la de abajo, como en el mockup.
 *
 * PARA REEMPLAZARLAS: se sueltan los archivos nuevos en `public/siluetas/` con
 * los mismos nombres y se corre `node scripts/ajustar-siluetas.mjs`, que ciñe
 * el viewBox al dibujo. No hay que tocar código.
 */
const ARCHIVOS = {
  nino: "silueta-nino.svg",
  nina: "silueta-nina.svg",
} as const;

const cache = new Map<string, string>();

function leerSilueta(archivo: string): string {
  const guardado = cache.get(archivo);
  if (guardado !== undefined) return guardado;

  let svg: string;
  try {
    svg = readFileSync(path.join(process.cwd(), "public", "siluetas", archivo), "utf8")
      .replace(/<metadata>[\s\S]*?<\/metadata>/, "")
      .replace(/\s(?:width|height|preserveAspectRatio)="[^"]*"/g, "")
      .replace("<svg", '<svg preserveAspectRatio="xMinYMax meet"');
  } catch {
    // Si falta el archivo, la tarjeta se pinta sin silueta en vez de romperse.
    svg = "";
  }
  cache.set(archivo, svg);
  return svg;
}

export function Silueta({
  genero,
  className,
}: {
  genero: string;
  className?: string;
}) {
  // El dominio en BD es exactamente 'Niño' | 'Niña' (check constraint).
  const archivo =
    genero.trim().toLowerCase() === "niña" ? ARCHIVOS.nina : ARCHIVOS.nino;
  const svg = leerSilueta(archivo);
  if (!svg) return null;

  return (
    <span
      aria-hidden
      className={cn("block [&>svg]:size-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
