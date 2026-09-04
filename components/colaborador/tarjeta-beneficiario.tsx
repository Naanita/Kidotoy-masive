import Link from "next/link";
import { Gift, ChevronRight, Ticket } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChipEstado } from "@/components/estado/chip-estado";
import { AvatarInicial } from "@/components/estado/avatar-inicial";
import { formatearCodigo } from "@/lib/format";
import type { BeneficiarioConEstado } from "@/lib/colaborador/datos";

/**
 * Tarjeta de un hijo en "Mis beneficiarios". Sin foto: avatar de iniciales con
 * color por nombre (son menores). Estado con ícono + texto, nunca solo color.
 */
export function TarjetaBeneficiario({ b }: { b: BeneficiarioConEstado }) {
  const confirmado = b.seleccion !== null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <AvatarInicial nombre={b.nombre} className="size-12 text-base" />
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-lg">{b.nombre}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {b.edad} años · {b.genero}
            </p>
          </div>
          <ChipEstado tipo={confirmado ? "confirmado" : "pendiente"} />
        </div>
      </CardHeader>
      <CardContent>
        {confirmado && b.seleccion ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Regalo elegido</p>
              <p className="font-medium">{b.seleccion.producto}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">Código de entrega</p>
              <p className="font-mono text-lg font-semibold tracking-wider">
                {formatearCodigo(b.seleccion.codigo_entrega)}
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
