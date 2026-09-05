import Link from "next/link";
import { Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarInicial } from "@/components/estado/avatar-inicial";
import { CoronaMarca } from "@/components/marca/corona";
import { Destellos } from "@/components/marca/destellos";
import { formatearCodigo } from "@/lib/format";
import type { BeneficiarioConEstado } from "@/lib/colaborador/datos";

/**
 * Pantalla de cierre cuando ya se eligió el regalo de todos los hijos.
 * Celebratoria PERO funcional: el colaborador vuelve aquí el día del evento a
 * buscar los códigos de sus hijos, así que la lista muestra cada código bien
 * visible y su enlace al comprobante. No es solo festejo: sigue sirviendo.
 */
export function CierreConfirmados({
  beneficiarios,
  primerNombre,
}: {
  beneficiarios: BeneficiarioConEstado[];
  primerNombre?: string;
}) {
  const total = beneficiarios.length;

  return (
    <div className="space-y-6">
      {/* Celebración a todo el ancho. */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-kido-turquesa to-kido-marino p-8 text-center text-card shadow-lg">
        <Destellos className="text-card" />
        <div className="relative">
          <CoronaMarca className="mx-auto mb-2 w-16 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-500" />
          <h1 className="font-display text-3xl font-bold">
            {primerNombre ? `¡Ya está, ${primerNombre}!` : "¡Ya está!"}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-card/90">
            Elegiste el regalo de {total === 1 ? "tu hijo" : `tus ${total} hijos`}
            . Guarda estos códigos para el día del evento.
          </p>
        </div>
      </div>

      {/* Lista funcional: cada hijo con su código y su comprobante. */}
      <div className="space-y-3">
        {beneficiarios.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="flex items-center gap-3 p-4">
              <AvatarInicial nombre={b.nombre} className="size-11 text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {b.nombre}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {b.seleccion?.producto}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t bg-secondary/60 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Código de entrega</p>
                <p className="truncate font-mono text-lg font-bold tracking-wider text-foreground">
                  {b.seleccion && formatearCodigo(b.seleccion.codigo_entrega)}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Link href={`/beneficiario/${b.id}/comprobante`}>
                  <Ticket className="mr-1.5 size-4" aria-hidden />
                  Comprobante
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
