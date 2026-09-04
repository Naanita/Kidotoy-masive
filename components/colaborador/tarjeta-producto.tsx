import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/estado/chip-estado";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/colaborador/datos";

const PLACEHOLDER = "https://placehold.co/600x600/EEE/31343C?text=Juguete";

/**
 * Tarjeta de un juguete del catálogo. Los agotados NO se ocultan: se muestran
 * atenuados con el chip "Agotado" (si desaparecieran, el colaborador creería que
 * la pantalla falló). El estado se comunica con ícono + texto, no solo color.
 */
export function TarjetaProducto({
  producto,
  beneficiarioId,
}: {
  producto: Producto;
  beneficiarioId: string;
}) {
  const agotado = producto.stock_disponible <= 0;
  const pocas = !agotado && producto.stock_disponible <= 3;

  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden transition-shadow hover:shadow-md",
        agotado && "opacity-75",
      )}
    >
      <CardContent className="flex-1 p-3">
        <div className="relative">
          <img
            src={producto.imagen_url ?? PLACEHOLDER}
            alt={producto.nombre}
            loading="lazy"
            width={600}
            height={600}
            className="aspect-square w-full rounded-lg bg-muted object-cover"
          />
          <div className="absolute left-2 top-2">
            {agotado ? (
              <ChipEstado tipo="agotado" />
            ) : pocas ? (
              <ChipEstado tipo="ultimas">Últimas {producto.stock_disponible}</ChipEstado>
            ) : (
              <ChipEstado tipo="disponible" />
            )}
          </div>
        </div>
        <h3 className="mt-3 font-heading font-semibold leading-tight">
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {producto.descripcion}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0">
        {agotado ? (
          <Button disabled variant="secondary" className="h-11 w-full">
            Agotado
          </Button>
        ) : (
          <Button asChild className="h-11 w-full">
            <Link
              href={`/acceso/beneficiario/${beneficiarioId}/confirmar/${producto.id}`}
            >
              Elegir este
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
