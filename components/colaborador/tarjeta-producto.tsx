import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/estado/chip-estado";
import { cn } from "@/lib/utils";
import type { Producto } from "@/lib/colaborador/datos";

const PLACEHOLDER = "https://placehold.co/600x600/EEE/31343C?text=Juguete";

/**
 * Tarjeta de juguete (DESIGN §4): imagen cuadrada a todo el ancho arriba, chip de
 * estado flotante sobre ella, nombre en Fredoka, descripción, y botón a todo el
 * ancho. Agotado: imagen al 45%, chip rojo, botón deshabilitado — nunca oculta.
 * El estado se comunica con ícono + texto, no solo color.
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
    <Card className="flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <img
          src={producto.imagen_url ?? PLACEHOLDER}
          alt={producto.nombre}
          loading="lazy"
          width={600}
          height={600}
          className={cn(
            "aspect-square w-full bg-secondary object-cover",
            agotado && "opacity-45",
          )}
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

      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-display text-base font-semibold leading-tight text-foreground">
          {producto.nombre}
        </h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {producto.descripcion}
          </p>
        )}
        <div className="mt-3 pt-0">
          {agotado ? (
            <Button disabled className="h-11 w-full">
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
        </div>
      </div>
    </Card>
  );
}
