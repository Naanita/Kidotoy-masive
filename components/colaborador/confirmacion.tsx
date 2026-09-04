"use client";

import { useActionState } from "react";
import Link from "next/link";
import { TriangleAlert, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatearFecha } from "@/lib/format";
import type { Ventana } from "@/lib/campana/ventana";
import type { Beneficiario, Producto } from "@/lib/colaborador/datos";

type EstadoConfirmacion = { code: string | null };
type Accion = (
  prev: EstadoConfirmacion,
  formData: FormData,
) => Promise<EstadoConfirmacion>;

const PLACEHOLDER = "https://placehold.co/600x600/EEE/31343C?text=Juguete";

const MENSAJES: Record<string, string> = {
  SIN_STOCK:
    "Este juguete se agotó mientras lo elegías. Por favor selecciona otro.",
  YA_TIENE_SELECCION: "Este beneficiario ya tiene un regalo confirmado.",
  FUERA_DE_VENTANA: "El periodo de selección no está abierto en este momento.",
  ERROR: "No pudimos confirmar la selección. Inténtalo de nuevo.",
};

export function Confirmacion({
  accion,
  beneficiario,
  producto,
  ventana,
}: {
  accion: Accion;
  beneficiario: Beneficiario;
  producto: Producto;
  ventana: Ventana;
}) {
  const [state, formAction, pending] = useActionState(accion, { code: null });
  const abierta = ventana.estado === "abierta";
  const code = state.code;

  const mensajeVentana =
    ventana.estado === "antes"
      ? `El periodo de selección abre el ${formatearFecha(ventana.inicio)}.`
      : ventana.estado === "cerrada"
        ? `El periodo de selección cerró el ${formatearFecha(ventana.fin)}.`
        : ventana.estado === "sin_definir"
          ? "El periodo de selección no está disponible por ahora."
          : null;

  return (
    <div className="space-y-5">
      <div className="flex gap-4">
        <img
          src={producto.imagen_url ?? PLACEHOLDER}
          alt={producto.nombre}
          className="size-24 shrink-0 rounded-md bg-muted object-cover"
        />
        <div>
          <p className="text-sm text-muted-foreground">
            Para {beneficiario.nombre}
          </p>
          <h2 className="font-display text-xl font-semibold text-foreground">
            {producto.nombre}
          </h2>
          {producto.descripcion && (
            <p className="mt-1 text-sm text-muted-foreground">
              {producto.descripcion}
            </p>
          )}
        </div>
      </div>

      <Alert variant="warning">
        <TriangleAlert className="size-4" aria-hidden />
        <AlertTitle>Esta elección no se puede cambiar</AlertTitle>
        <AlertDescription>
          Al confirmar, {beneficiario.nombre} quedará con este regalo y no
          podrás elegir otro. Solo un administrador de Kidotoy puede liberarlo.
        </AlertDescription>
      </Alert>

      {!abierta && mensajeVentana && (
        <Alert>
          <Clock className="size-4" aria-hidden />
          <AlertTitle>Aún no puedes confirmar</AlertTitle>
          <AlertDescription>{mensajeVentana}</AlertDescription>
        </Alert>
      )}

      {code && (
        <Alert variant="destructive">
          <AlertDescription>
            {MENSAJES[code] ?? MENSAJES.ERROR}
          </AlertDescription>
        </Alert>
      )}

      {code === "SIN_STOCK" ? (
        <Button asChild className="h-12 w-full text-base">
          <Link href={`/acceso/beneficiario/${beneficiario.id}`}>
            Volver al catálogo
          </Link>
        </Button>
      ) : code === "YA_TIENE_SELECCION" ? (
        <Button asChild className="h-12 w-full text-base">
          <Link href="/acceso/inicio">Ir a mis beneficiarios</Link>
        </Button>
      ) : (
        <div className="space-y-3">
          <form action={formAction}>
            <input type="hidden" name="beneficiario_id" value={beneficiario.id} />
            <input type="hidden" name="producto_id" value={producto.id} />
            <Button
              type="submit"
              className="h-12 w-full text-base"
              disabled={!abierta || pending}
            >
              {pending && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              )}
              Confirmar regalo
            </Button>
          </form>
          <Button
            asChild
            variant="outline"
            className="h-12 w-full text-base"
          >
            <Link href={`/acceso/beneficiario/${beneficiario.id}`}>Volver</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
