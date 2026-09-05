"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Foto de bienvenida del login, con la forma orgánica de la propuesta del
 * cliente: esquinas muy redondeadas y un MORDISCO cóncavo arriba a la izquierda,
 * donde se acomodan el logo y "Portal de bienestar". Detrás va la misma forma en
 * turquesa Kidotoy, desplazada hacia abajo y a la derecha (no es una sombra
 * difusa: es un contorno sólido corrido).
 *
 * La forma se recorta con un `clipPath` en unidades de caja (`objectBoundingBox`,
 * 0–1), no con `border-radius`: el mordisco es cóncavo y ningún radio lo hace.
 * Al ser relativo, la misma ruta sirve en móvil y en escritorio. Los puntos
 * salen de medir el mockup del cliente pixel a pixel.
 *
 * El titular va ENCIMA de la foto, sobre una banda clara translúcida en la parte
 * baja (ver `PanelBienvenida`); por eso este componente acepta `children`.
 *
 * La imagen la pone el cliente en `public/bienvenida/familia.jpg`. Si falta o
 * falla, se muestra un marcador del mismo tamaño para que nada se mueva.
 */
const RUTA_FOTO = "/bienvenida/familia.jpg";
const ID_RECORTE = "recorte-foto-bienvenida";

const RUTA_RECORTE = [
  "M0.43 0",
  "L0.945 0",
  "Q1 0 1 0.058",
  "L1 0.942",
  "Q1 1 0.943 1",
  "L0.057 1",
  "Q0 1 0 0.942",
  "L0 0.329",
  "Q0 0.259 0.056 0.259",
  "L0.233 0.235",
  "Q0.312 0.215 0.312 0.153",
  "L0.312 0.1",
  "C0.315 0.055 0.355 0 0.43 0",
  "Z",
].join(" ");

/**
 * El mordisco solo existe de `md` para arriba: a 390 px mide ~105 px de ancho y
 * la marca no cabe dentro (ver `PanelBienvenida`). En móvil la forma se resuelve
 * con radios asimétricos, que siguen leyéndose orgánicos.
 */
const FORMA =
  "rounded-[2.75rem_1.25rem_2.75rem_1.25rem] md:rounded-none md:[clip-path:url(#recorte-foto-bienvenida)]";

export function FotoBienvenida({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const [fallo, setFallo] = useState(false);

  return (
    <div className={cn("relative isolate", className)}>
      {/* Definición del recorte. Sin tamaño: solo aporta la forma. */}
      <svg aria-hidden className="absolute size-0">
        <defs>
          <clipPath id={ID_RECORTE} clipPathUnits="objectBoundingBox">
            <path d={RUTA_RECORTE} />
          </clipPath>
        </defs>
      </svg>

      {/* Contorno turquesa: la misma forma, corrida abajo y a la derecha. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 translate-x-2.5 translate-y-2.5 bg-kido-turquesa",
          FORMA,
        )}
      />

      <div className={cn("relative size-full overflow-hidden bg-acueducto-azul", FORMA)}>
        {!fallo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={RUTA_FOTO}
            alt="Una familia disfrutando al aire libre"
            onError={() => setFallo(true)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-white/10 px-8 text-center text-white/70">
            <ImageIcon className="size-9" aria-hidden />
            <span className="text-xs font-medium">Foto de bienvenida</span>
            <span className="text-[0.7rem] leading-snug text-white/55">
              Reemplázala en public/bienvenida/familia.jpg
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
