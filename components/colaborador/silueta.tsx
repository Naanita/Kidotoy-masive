import { cn } from "@/lib/utils";
import { SILUETA_NINA, SILUETA_NINO } from "./siluetas-datos";

/**
 * Silueta ilustrada del beneficiario, de fondo en su tarjeta. Nunca es la foto
 * de un menor: es un dibujo plano.
 *
 * Se INCRUSTA el SVG en el HTML en vez de usar `<img>` o un filtro, porque los
 * archivos vienen con `fill="currentColor"`: incrustados heredan el color del
 * contenedor, así que la tarjeta los tiñe con `text-kido-*-claro` —un tono más
 * claro de su propio color— y el mismo archivo sirve para las tres tarjetas.
 *
 * El SVG llega desde un MÓDULO (`siluetas-datos.ts`), no leyendo `public/` del
 * disco. Hay plataformas de despliegue sin sistema de archivos real para el
 * servidor —Cloudflare Workers publica `public/` como assets, fuera del bundle—
 * y una lectura en disco allí rompe "Mis beneficiarios" en producción sin fallar
 * en el build. Como módulo, el mismo código sirve en cualquier plataforma.
 *
 * PARA REEMPLAZARLAS: se sueltan los archivos nuevos en `public/siluetas/` con
 * los mismos nombres y se corre `node scripts/ajustar-siluetas.mjs`, que ciñe el
 * viewBox al dibujo y regenera `siluetas-datos.ts`.
 */
export function Silueta({
  genero,
  className,
}: {
  genero: string;
  className?: string;
}) {
  // El dominio en BD es exactamente 'Niño' | 'Niña' (check constraint).
  const svg = genero.trim().toLowerCase() === "niña" ? SILUETA_NINA : SILUETA_NINO;
  if (!svg) return null;

  return (
    <span
      aria-hidden
      className={cn("block [&>svg]:size-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
