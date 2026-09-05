import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Catalogo } from "@/components/colaborador/catalogo";
import { Stepper } from "@/components/colaborador/stepper";
import { IndicadorVivo } from "@/components/colaborador/indicador-vivo";
import {
  obtenerBeneficiario,
  obtenerCatalogo,
  obtenerComprobante,
} from "@/lib/colaborador/datos";
import { obtenerVentana } from "@/lib/campana/ventana";
import { formatearFecha } from "@/lib/format";

export default async function PaginaCatalogo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const beneficiario = await obtenerBeneficiario(id);
  if (!beneficiario) notFound();

  // Si ya confirmó, no vuelve a elegir: va directo a su comprobante.
  const yaConfirmado = await obtenerComprobante(id);
  if (yaConfirmado) redirect(`/beneficiario/${id}/comprobante`);

  const [productos, ventana] = await Promise.all([
    obtenerCatalogo(beneficiario.edad, beneficiario.genero),
    obtenerVentana(),
  ]);

  const mensajeVentana =
    ventana.estado === "antes"
      ? `La selección abre el ${formatearFecha(ventana.inicio)}. Puedes mirar el catálogo mientras tanto.`
      : ventana.estado === "cerrada"
        ? `La selección cerró el ${formatearFecha(ventana.fin)}.`
        : null;

  return (
    <div className="min-h-dvh">
      <header className="flex items-center border-b px-2 py-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/inicio">
            <ChevronLeft className="mr-1 size-4" aria-hidden />
            Mis beneficiarios
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mx-auto mb-6 max-w-md">
          <Stepper actual={2} />
        </div>

        <div className="mb-5">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Elige un regalo para {beneficiario.nombre}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {beneficiario.edad} años · {beneficiario.genero} · 6 opciones
          </p>
          <IndicadorVivo className="mt-2" />
        </div>

        {mensajeVentana && (
          <Alert variant="warning" className="mb-4">
            <Clock className="size-4" aria-hidden />
            <AlertTitle>Periodo de selección</AlertTitle>
            <AlertDescription>{mensajeVentana}</AlertDescription>
          </Alert>
        )}

        <Catalogo
          productosIniciales={productos}
          edad={beneficiario.edad}
          genero={beneficiario.genero}
          beneficiarioId={id}
          seleccionAbierta={ventana.estado === "abierta"}
        />
      </main>
    </div>
  );
}
