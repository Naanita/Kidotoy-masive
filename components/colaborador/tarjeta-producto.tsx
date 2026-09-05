import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/estado/chip-estado";
import { ImagenProducto } from "@/components/colaborador/imagen-producto";
import type { Producto } from "@/lib/colaborador/datos";

/**
 * Tarjeta de juguete: EL componente del producto.
 *
 *  - Alturas alineadas en la rejilla: nombre y descripción reservan siempre dos
 *    líneas (truncando con ellipsis) y el botón queda anclado abajo, así todos
 *    los botones caen en la misma línea sin importar el largo del texto.
 *  - Jerarquía: el NOMBRE domina (es lo que la persona compara); la descripción
 *    es secundaria y apagada.
 *  - El chip solo aparece cuando dice algo — Últimas unidades / Agotado. Seis
 *    chips "Disponible" idénticos serían ruido: disponible es el estado por
 *    defecto, sin etiqueta.
 *  - Imagen más baja en escritorio (el contenido pesa más), cuadrada en móvil.
 *    Sin foto real → preview de marca, nunca un recuadro roto. Zoom sutil solo
 *    donde hay hover real; hundido al presionar en táctil.
 *  - Agotada: mismo tamaño, imagen atenuada y desaturada, chip rojo, botón
 *    deshabilitado. Nunca se oculta. Fuera de periodo: visible pero sin elegir.
 */
export function TarjetaProducto({
  producto,
  beneficiarioId,
  seleccionAbierta = true,
}: {
  producto: Producto;
  beneficiarioId: string;
  seleccionAbierta?: boolean;
}) {
  const agotado = producto.stock_disponible <= 0;
  const pocas = !agotado && producto.stock_disponible <= 3;
  const puedeElegir = !agotado && seleccionAbierta;

  return (
    <Card className="group flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-lg">
      <div className="relative overflow-hidden">
        <ImagenProducto
          src={producto.imagen_url}
          alt={producto.nombre}
          atenuada={agotado}
          className="aspect-square w-full transition-transform duration-300 ease-out [@media(hover:hover)]:group-hover:scale-[1.04]"
        />
        {/* Chip solo cuando comunica: últimas o agotado. */}
        {(agotado || pocas) && (
          <div className="absolute left-2 top-2">
            <ChipEstado tipo={agotado ? "agotado" : "ultimas"} solido />
          </div>
        )}
      </div>

      <div className="flex flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base font-semibold leading-snug text-foreground">
          {producto.nombre}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {producto.descripcion}
        </p>
        <div className="pt-3">
          {puedeElegir ? (
            <Button asChild className="h-11 w-full">
              <Link
                href={`/beneficiario/${beneficiarioId}/confirmar/${producto.id}`}
              >
                Elegir este
              </Link>
            </Button>
          ) : (
            <Button disabled className="h-11 w-full">
              {agotado ? "Agotado" : "Fuera de periodo"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
