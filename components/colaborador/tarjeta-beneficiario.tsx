import Link from "next/link";
import { Silueta } from "@/components/colaborador/silueta";
import { ImagenProducto } from "@/components/colaborador/imagen-producto";
import { cn } from "@/lib/utils";
import type { BeneficiarioConEstado } from "@/lib/colaborador/datos";

/**
 * Tarjeta grande de un hijo, réplica de la propuesta del cliente: fondo con un
 * color de marca Kidotoy, silueta ilustrada a la IZQUIERDA, texto a la derecha
 * (nombre, "{edad} años · {género}") y la píldora de estado. La confirmada
 * agrega, DEBAJO de un divisor, la miniatura del juguete alineada a la izquierda.
 *
 * Colores: los EXACTOS del mockup (turquesa y morado del manual Kidotoy), sin
 * variantes oscurecidas. Se asignan por ORDEN de la lista, no por hash del id,
 * para que el primer hijo salga turquesa y el segundo morado como en la
 * propuesta.
 *
 * El tercero usa el AZUL MARINO del manual, no el rojo ni el amarillo: el rojo
 * de tarjeta se traga la píldora roja de "Falta elegir" (misma tinta sobre la
 * misma tinta) y sobre el amarillo el nombre en blanco queda en 2.0:1, por
 * debajo incluso del 3:1 de texto grande. Marino es el quinto color del manual
 * y deja las dos píldoras legibles.
 *
 * Sobre el contraste: el nombre va en texto grande y bold (umbral AA 3:1) y los
 * colores de marca pasan ahí. La línea pequeña de edad/género es la ajustada, y
 * se resuelve subiéndole el peso y una sombra de texto mínima —nunca cambiando
 * el color de la marca—.
 *
 * La tarjeta entera es el objetivo táctil (grande, para móvil): lleva al
 * catálogo si está pendiente, o al comprobante si ya eligió.
 */
const PALETA = [
  { fondo: "bg-kido-turquesa", silueta: "text-kido-turquesa-claro" },
  { fondo: "bg-kido-morado", silueta: "text-kido-morado-claro" },
  { fondo: "bg-kido-marino", silueta: "text-kido-marino-claro" },
] as const;

export function TarjetaBeneficiario({
  b,
  orden = 0,
}: {
  b: BeneficiarioConEstado;
  /** Posición en la lista: decide el color, como en la propuesta. */
  orden?: number;
}) {
  const confirmado = b.seleccion !== null;
  const color = PALETA[orden % PALETA.length];
  const href = confirmado
    ? `/beneficiario/${b.id}/comprobante`
    : `/beneficiario/${b.id}`;

  return (
    <Link
      href={href}
      aria-label={
        confirmado
          ? `Ver el comprobante de ${b.nombre}`
          : `Elegir el regalo de ${b.nombre}`
      }
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl text-white shadow-sm transition-transform",
        "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-acueducto-azul/40 focus-visible:ring-offset-2",
        color.fondo,
      )}
    >
      {/* Bloque superior: silueta a la izquierda, identidad a la derecha. La
          silueta se recorta AQUÍ, así que nunca se mete bajo la miniatura. */}
      <div
        className={cn(
          "relative flex min-h-[10.5rem] flex-1 items-center overflow-hidden sm:min-h-[12rem]",
          color.silueta,
        )}
      >
        {/* Marca de agua: detrás del texto, pegada a la izquierda, alta, y
            recortada por el borde inferior de ESTE bloque (nunca invade la
            miniatura del juguete, que vive en el bloque de abajo). */}
        <Silueta
          genero={b.genero}
          className="absolute -bottom-[12%] left-[4%] top-[5%] w-[34%]"
        />
        <div className="relative z-10 w-full py-6 pl-[38%] pr-5 sm:pr-7">
          <p className="font-heading text-2xl font-bold leading-tight text-white sm:text-3xl">
            {b.nombre}
          </p>
          <p className="mt-1 text-sm font-medium text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.28)] sm:text-base">
            {b.edad} años · {b.genero}
          </p>
          <div className="mt-3">
            {confirmado ? (
              <span className="inline-flex rounded-full bg-kido-amarillo px-4 py-1.5 text-sm font-bold text-warning-foreground">
                Regalo confirmado
              </span>
            ) : (
              <span className="inline-flex rounded-full bg-kido-rojo px-4 py-1.5 text-sm font-bold text-white">
                Falta elegir
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Zona inferior solo si confirmó: divisor + miniatura + nombre del juguete. */}
      {confirmado && b.seleccion && (
        <div className="px-5 sm:px-7">
          {/* Divisor metido por los dos lados, como en el mockup. */}
          <div className="flex items-center gap-4 border-t border-white/30 py-5">
            <ImagenProducto
              src={b.seleccion.imagenUrl ?? null}
              alt={b.seleccion.producto}
              className="size-16 shrink-0 rounded-md"
            />
            <span className="leading-snug sm:text-lg">
              {b.seleccion.producto}
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
