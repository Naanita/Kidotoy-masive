import Link from "next/link";
import { CheckCircle2, Gift, ChevronRight, Ticket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BeneficiarioConEstado } from "@/lib/colaborador/datos";

/**
 * Tarjeta de un hijo en "Mis beneficiarios". Estado diferenciado con icono +
 * texto (no solo color): Confirmado muestra el juguete y el código de entrega;
 * Pendiente muestra el botón para elegir. El estado nunca se comunica solo con
 * color, por accesibilidad.
 */
export function TarjetaBeneficiario({ b }: { b: BeneficiarioConEstado }) {
  const confirmado = b.seleccion !== null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg">{b.nombre}</CardTitle>
          {confirmado ? (
            <Badge className="bg-success text-success-foreground hover:bg-success">
              <CheckCircle2 className="mr-1 size-3.5" aria-hidden />
              Confirmado
            </Badge>
          ) : (
            <Badge variant="secondary">Pendiente</Badge>
          )}
        </div>
        <CardDescription>
          {b.edad} años · {b.genero}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {confirmado && b.seleccion ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Regalo elegido</p>
              <p className="font-medium">{b.seleccion.producto}</p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">Código de entrega</p>
              <p className="font-mono text-lg font-semibold tracking-wider">
                {b.seleccion.codigo_entrega}
              </p>
            </div>
            <Button asChild variant="outline" className="h-11 w-full">
              <Link href={`/acceso/beneficiario/${b.id}/comprobante`}>
                <Ticket className="mr-2 size-4" aria-hidden />
                Ver comprobante
              </Link>
            </Button>
          </div>
        ) : (
          <Button asChild className="h-12 w-full text-base">
            <Link href={`/acceso/beneficiario/${b.id}`}>
              <Gift className="mr-2 size-4" aria-hidden />
              Elegir regalo
              <ChevronRight className="ml-auto size-4" aria-hidden />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
