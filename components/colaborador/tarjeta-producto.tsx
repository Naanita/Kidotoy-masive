import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Producto } from "@/lib/colaborador/datos";

const PLACEHOLDER = "https://placehold.co/600x600/EEE/31343C?text=Juguete";

/**
 * Tarjeta de un juguete del catálogo. Los agotados NO se ocultan: se muestran
 * deshabilitados con la etiqueta "Agotado" (si desaparecieran, el colaborador
 * creería que la pantalla falló). El estado se comunica con texto, no solo
 * color.
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
    <Card className={agotado ? "opacity-70" : undefined}>
      <CardContent className="p-3">
        <img
          src={producto.imagen_url ?? PLACEHOLDER}
          alt={producto.nombre}
          loading="lazy"
          className="aspect-square w-full rounded-md bg-muted object-cover"
        />
        <div className="mt-3 flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight">{producto.nombre}</h3>
          {agotado ? (
            <Badge variant="destructive" className="shrink-0">
              Agotado
            </Badge>
          ) : pocas ? (
            <Badge className="shrink-0 bg-warning text-warning-foreground hover:bg-warning">
              Últimas {producto.stock_disponible}
            </Badge>
          ) : null}
        </div>
        {producto.descripcion && (
          <p className="mt-1 text-sm text-muted-foreground">
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
