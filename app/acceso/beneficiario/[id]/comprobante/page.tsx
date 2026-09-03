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
import { obtenerComprobante } from "@/lib/colaborador/datos";
import { obtenerVentana } from "@/lib/campana/ventana";
import { formatearFecha } from "@/lib/format";

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

      <main className="mx-auto max-w-md px-4 py-6 text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <h1 className="mt-3 text-2xl font-bold">Regalo confirmado</h1>
        <p className="text-muted-foreground">{comprobante.beneficiario}</p>

        <Card className="mt-6 text-left">
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Juguete</p>
              <p className="font-medium">{comprobante.producto}</p>
            </div>

            <div className="flex justify-center">
              <QrEntrega value={comprobante.codigo_entrega} />
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Código de entrega</p>
              <p className="font-mono text-2xl font-bold tracking-widest">
                {comprobante.codigo_entrega}
              </p>
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

        <Alert className="mt-6 text-left">
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
