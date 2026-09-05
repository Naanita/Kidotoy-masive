"use client";

import { useState } from "react";
import { Gift, type LucideIcon } from "lucide-react";
import { PreviewImagen } from "@/components/marca/preview-imagen";
import { cn } from "@/lib/utils";

/**
 * Imagen de un juguete con respaldo honesto: si no hay foto (o si la URL falla al
 * cargar), muestra el preview de marca en vez de un recuadro roto. Así la tarjeta
 * nunca "se ve rota", ni en el piloto (sin fotos) ni cuando un administrador
 * cargue una URL que un día deje de responder.
 *
 * `object-contain`, NUNCA `object-cover`. Con cover el juguete se recorta por los
 * bordes: se pierde el manubrio de un scooter, la caja de un juego, media casa de
 * muñecas. El colaborador está eligiendo un regalo a partir de esta foto, así que
 * tiene que verla completa. Las fotos del catálogo salen cuadradas de 800×800
 * sobre blanco (`scripts/catalogo-imagenes.mjs`), y por eso el fondo aquí es
 * BLANCO y no `bg-secondary`: cuando el contenedor no es cuadrado, las bandas del
 * letterbox se funden con el fondo de la propia foto en vez de dibujar un marco.
 */
export function ImagenProducto({
  src,
  alt,
  className,
  etiqueta = "Foto del juguete",
  icon = Gift,
  atenuada = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  etiqueta?: string;
  icon?: LucideIcon;
  atenuada?: boolean;
}) {
  const [falloCarga, setFalloCarga] = useState(false);
  const atenuar = atenuada && "opacity-45 grayscale";

  if (!src || falloCarga) {
    return (
      <PreviewImagen
        etiqueta={etiqueta}
        icon={icon}
        className={cn(className, atenuar)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={600}
      height={600}
      onError={() => setFalloCarga(true)}
      className={cn(className, "bg-white object-contain", atenuar)}
    />
  );
}
