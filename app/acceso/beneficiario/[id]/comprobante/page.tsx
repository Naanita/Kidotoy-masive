import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrEntrega } from "@/components/colaborador/qr-entrega";
import { BotonCopiarCodigo } from "@/components/colaborador/boton-copiar";
import { Stepper } from "@/components/colaborador/stepper";
import { obtenerComprobante } from "@/lib/colaborador/datos";
import { obtenerVentana } from "@/lib/campana/ventana";
import { formatearFecha, formatearCodigo } from "@/lib/format";

export default async function PaginaComprobante({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // El comprobante NO caduca: se lee sin importar la ventana. Lo necesita el
  // colaborador el día del evento aunque el periodo ya haya cerrado.
  const comprobante = await obtenerComprobante(id);
  if (!comprobante) notFound();

  const ventana = await obtenerVentana();

  return (
    <div className="min-h-dvh">
      <header className="flex items-center border-b px-2 py-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/acceso/inicio">
            <ChevronLeft className="mr-1 size-4" aria-hidden />
            Mis beneficiarios
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <div className="mb-6">
          <Stepper actual={4} />
        </div>

        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-500">
            <CheckCircle2 className="size-10 text-success" aria-hidden />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
            ¡Regalo confirmado!
          </h1>
          <p className="mt-1 text-muted-foreground">{comprobante.beneficiario}</p>
        </div>

        <Card className="mt-6 text-left">
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Juguete</p>
              <p className="font-display text-lg font-semibold">
                {comprobante.producto}
              </p>
            </div>

            <div className="flex justify-center">
              <QrEntrega value={comprobante.codigo_entrega} />
            </div>

            <div className="rounded-lg bg-secondary p-4 text-center">
              <p className="text-sm text-muted-foreground">Código de entrega</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.15em] text-foreground">
                {formatearCodigo(comprobante.codigo_entrega)}
              </p>
              <BotonCopiarCodigo
                codigo={comprobante.codigo_entrega}
                className="mt-3 h-10"
              />
            </div>
          </CardContent>
        </Card>

        {(ventana.eventoFecha || ventana.eventoLugar) && (
          <div className="mt-6 space-y-1.5 text-sm text-muted-foreground">
            {ventana.eventoFecha && (
              <p className="flex items-center justify-center gap-2">
                <CalendarDays className="size-4" aria-hidden />
                {formatearFecha(ventana.eventoFecha)}
              </p>
            )}
            {ventana.eventoLugar && (
              <p className="flex items-center justify-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {ventana.eventoLugar}
              </p>
            )}
          </div>
        )}

        <Alert variant="info" className="mt-6">
          <Ticket className="size-4" aria-hidden />
          <AlertDescription>
            Presenta este código (o el QR) el día del evento para reclamar el
            regalo.
          </AlertDescription>
        </Alert>

        <Button asChild variant="outline" className="mt-6 h-12 w-full">
          <Link href="/acceso/inicio">Volver a mis beneficiarios</Link>
        </Button>
      </main>
    </div>
  );
}
