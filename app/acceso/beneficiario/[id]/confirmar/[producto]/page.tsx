import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Confirmacion } from "@/components/colaborador/confirmacion";
import {
  obtenerBeneficiario,
  obtenerComprobante,
  obtenerProducto,
} from "@/lib/colaborador/datos";
import { obtenerVentana } from "@/lib/campana/ventana";
import { confirmarSeleccion } from "./actions";

export default async function PaginaConfirmar({
  params,
}: {
  params: Promise<{ id: string; producto: string }>;
}) {
  const { id, producto: productoId } = await params;

  const beneficiario = await obtenerBeneficiario(id);
  if (!beneficiario) notFound();

  // Si ya confirmó, no hay nada que confirmar: a su comprobante.
  const yaConfirmado = await obtenerComprobante(id);
  if (yaConfirmado) redirect(`/acceso/beneficiario/${id}/comprobante`);

  const producto = await obtenerProducto(productoId);
  // El producto debe ser del grupo EXACTO del beneficiario (edad + género).
  if (
    !producto ||
    producto.edad !== beneficiario.edad ||
    producto.genero !== beneficiario.genero
  ) {
    notFound();
  }

  const ventana = await obtenerVentana();

  return (
    <div className="min-h-dvh">
      <header className="flex items-center border-b px-2 py-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/acceso/beneficiario/${id}`}>
            <ChevronLeft className="mr-1 size-4" aria-hidden />
            Volver al catálogo
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        <h1 className="mb-5 text-xl font-semibold">Confirma tu elección</h1>
        <Confirmacion
          accion={confirmarSeleccion}
          beneficiario={beneficiario}
          producto={producto}
          ventana={ventana}
        />
      </main>
    </div>
  );
}
