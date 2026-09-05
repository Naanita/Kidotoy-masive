"use client";

import { useActionState } from "react";
import Link from "next/link";
import { TriangleAlert, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AvatarInicial } from "@/components/estado/avatar-inicial";
import { ImagenProducto } from "@/components/colaborador/imagen-producto";
import { formatearFecha } from "@/lib/format";
import type { Ventana } from "@/lib/campana/ventana";
import type { Beneficiario, Producto } from "@/lib/colaborador/datos";

type EstadoConfirmacion = { code: string | null };
type Accion = (
  prev: EstadoConfirmacion,
  formData: FormData,
) => Promise<EstadoConfirmacion>;

const MENSAJES: Record<string, string> = {
  SIN_STOCK:
    "Este juguete se agotó mientras lo elegías. Por favor selecciona otro.",
  YA_TIENE_SELECCION: "Este beneficiario ya tiene un regalo confirmado.",
  FUERA_DE_VENTANA: "El periodo de selección no está abierto en este momento.",
  ERROR: "No pudimos confirmar la selección. Inténtalo de nuevo.",
};

/**
 * Confirmación: un solo objetivo, mucho aire. La imagen del juguete es la
 * protagonista; el nombre en Fredoka y para quién es. La advertencia va en ÁMBAR
 * (atención, no error rojo): la decisión es irreversible y hay que decirlo con
 * calma. SIN_STOCK muestra el mensaje exacto y cambia la acción a volver al
 * catálogo (que al recargar ya sale actualizado).
 */
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
    <div className="space-y-6">
      <div className="mx-auto w-full max-w-[15rem]">
        <ImagenProducto
          src={producto.imagen_url}
          alt={producto.nombre}
          className="aspect-square w-full rounded-xl shadow-md"
        />
      </div>

      <div className="text-center">
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <AvatarInicial nombre={beneficiario.nombre} className="size-6 text-[10px]" />
          Para {beneficiario.nombre}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
          {producto.nombre}
        </h2>
        {producto.descripcion && (
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {producto.descripcion}
          </p>
        )}
      </div>

      {/* La advertencia de irreversibilidad no aplica si ya hubo un error (p. ej.
          SIN_STOCK): ahí manda el mensaje rojo accionable, sin ruido. */}
      {!code && (
        <Alert variant="warning">
          <TriangleAlert aria-hidden />
          <AlertTitle>Esta elección no se puede cambiar</AlertTitle>
          <AlertDescription>
            Al confirmar, {beneficiario.nombre} quedará con este regalo y no
            podrás elegir otro. Solo un administrador de Kidotoy puede liberarlo.
          </AlertDescription>
        </Alert>
      )}

      {!abierta && mensajeVentana && (
        <Alert>
          <Clock aria-hidden />
          <AlertTitle>Aún no puedes confirmar</AlertTitle>
          <AlertDescription>{mensajeVentana}</AlertDescription>
        </Alert>
      )}

      {code && (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden />
          <AlertDescription>{MENSAJES[code] ?? MENSAJES.ERROR}</AlertDescription>
        </Alert>
      )}

      {code === "SIN_STOCK" ? (
        <Button asChild className="h-12 w-full text-base">
          <Link href={`/beneficiario/${beneficiario.id}`}>
            Volver al catálogo
          </Link>
        </Button>
      ) : code === "YA_TIENE_SELECCION" ? (
        <Button asChild className="h-12 w-full text-base">
          <Link href="/inicio">Ir a mis beneficiarios</Link>
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
          <Button asChild variant="outline" className="h-12 w-full text-base">
            <Link href={`/beneficiario/${beneficiario.id}`}>Cancelar</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
