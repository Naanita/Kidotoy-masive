import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  CalendarDays,
  MapPin,
  Clock,
  Ticket,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrEntrega } from "@/components/colaborador/qr-entrega";
import { BotonCopiarCodigo } from "@/components/colaborador/boton-copiar";
import { BotonDescargar } from "@/components/colaborador/boton-descargar";
import { Stepper } from "@/components/colaborador/stepper";
import { CoronaMarca } from "@/components/marca/corona";
import { Destellos } from "@/components/marca/destellos";
import { FranjaMarca } from "@/components/marca/franja";
import { AvatarInicial } from "@/components/estado/avatar-inicial";
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
  const hayEvento =
    ventana.eventoFecha || ventana.eventoLugar || ventana.eventoHora;

  return (
    <div className="flex min-h-dvh flex-col bg-secondary print:bg-white">
      <header className="flex items-center border-b bg-card px-2 py-2 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href="/inicio">
            <ChevronLeft className="mr-1 size-4" aria-hidden />
            Mis beneficiarios
          </Link>
        </Button>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <div className="mb-6 print:hidden">
          <Stepper actual={4} />
        </div>

        {/* Celebración: la corona (Kidotoy) corona el check (confirmado). */}
        <div className="relative py-2 text-center">
          <Destellos className="print:hidden" />
          <div className="relative">
            <CoronaMarca className="mx-auto mb-2 w-14 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-500" />
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-500 print:bg-transparent">
              <CheckCircle2 className="size-10 text-success" aria-hidden />
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-foreground">
              ¡Regalo confirmado!
            </h1>
          </div>
        </div>

        {/* EL BOLETO DE ENTREGA — pieza física: cabecera de marca, resumen,
            perforación con muescas, y el "número de serie" (el código) + QR. */}
        <div className="relative mt-6 rounded-xl border bg-card shadow-md print:shadow-none">
          <div className="overflow-hidden rounded-t-xl">
            <FranjaMarca className="h-1.5" />
          </div>

          {/* Zona A — resumen: para quién y qué juguete. */}
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <AvatarInicial
                nombre={comprobante.beneficiario}
                className="size-11 text-sm"
              />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Para</p>
                <p className="truncate font-semibold text-foreground">
                  {comprobante.beneficiario}
                </p>
                <p className="text-xs text-muted-foreground">
                  {comprobante.edad} años
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-kido-turquesa/20 to-kido-morado/20">
                {comprobante.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comprobante.imagen_url}
                    alt={comprobante.producto}
                    className="size-full bg-white object-contain"
                  />
                ) : (
                  <Gift className="size-6 text-kido-turquesa/80" aria-hidden />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Juguete</p>
                <p className="font-display font-semibold text-foreground">
                  {comprobante.producto}
                </p>
              </div>
            </div>
          </div>

          {/* Perforación con muescas laterales (el boleto se "arranca" aquí). */}
          <div className="relative" aria-hidden>
            <span className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-secondary print:bg-white" />
            <span className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-secondary print:bg-white" />
            <div className="mx-5 border-t-2 border-dashed border-border" />
          </div>

          {/* Zona B — el código de entrega: el objeto que se presenta. */}
          <div className="p-5 text-center">
            <div className="flex justify-center">
              <QrEntrega value={comprobante.codigo_entrega} />
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Código de entrega
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-[0.15em] text-foreground">
              {formatearCodigo(comprobante.codigo_entrega)}
            </p>
            <BotonCopiarCodigo
              codigo={comprobante.codigo_entrega}
              className="mt-3 h-10 print:hidden"
            />
          </div>
        </div>

        {/* El día del evento: fecha, lugar y horario (solo si existe en la BD). */}
        {hayEvento && (
          <div className="mt-6 rounded-lg border bg-card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
              El día del evento
            </p>
            <div className="space-y-1.5 text-sm text-foreground">
              {ventana.eventoFecha && (
                <p className="flex items-center gap-2">
                  <CalendarDays
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  {formatearFecha(ventana.eventoFecha)}
                </p>
              )}
              {ventana.eventoHora && (
                <p className="flex items-center gap-2">
                  <Clock
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  {ventana.eventoHora}
                </p>
              )}
              {ventana.eventoLugar && (
                <p className="flex items-center gap-2">
                  <MapPin
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  {ventana.eventoLugar}
                </p>
              )}
            </div>
          </div>
        )}

        <Alert variant="info" className="mt-6">
          <Ticket aria-hidden />
          <AlertDescription>
            Presenta este código (o el QR) el día del evento para reclamar el
            regalo.
          </AlertDescription>
        </Alert>

        <div className="mt-6 space-y-3 print:hidden">
          <BotonDescargar className="h-12 w-full text-base" />
          <Button asChild variant="outline" className="h-12 w-full text-base">
            <Link href="/inicio">Volver a mis beneficiarios</Link>
          </Button>
        </div>
      </main>

      <FranjaMarca className="mt-10 print:hidden" />
    </div>
  );
}
