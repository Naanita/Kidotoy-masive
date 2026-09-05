"use client";

import { useState, useTransition } from "react";
import {
  Search,
  QrCode,
  CheckCircle2,
  TriangleAlert,
  ArrowRight,
  ChevronLeft,
  Loader2,
  Tent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { FranjaMarca } from "@/components/marca/franja";
import { EscanerQr } from "./escaner-qr";
import { ImagenProducto } from "@/components/colaborador/imagen-producto";
import { buscarEntrega, marcarEntrega } from "@/app/entrega/acciones";
import { formatearFechaHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FichaEntrega } from "@/lib/entrega/datos";

type Pantalla = "inicio" | "lista" | "ficha" | "exito" | "ya";
type Relacion = "correcta" | "otra" | "sin_carpa" | "sin_operario";

interface Confirmacion {
  beneficiario: string;
  producto: string;
  carpa: string | null;
  fueraDeCarpa: boolean;
  entregadoEn: string | null;
  operarioAnterior: string | null;
}

/**
 * Módulo del operario. La interfaz de MENOR densidad del sistema: se usa de pie,
 * al aire libre, con una mano, cientos de veces al día. Objetivos táctiles
 * enormes, contraste máximo y un sistema de color semántico legible a un metro:
 *   · azul marino = tu carpa (contexto estable)   · azul = escanear (la acción)
 *   · verde = adelante / entregado                 · rojo = alto / ya entregado
 *   · amarillo = ojo, va a otra carpa (no bloquea)
 * Toda la lógica pasa por registrar_entrega(); aquí solo cambia la presentación.
 */
export function ModuloEntrega({
  totalInicial,
  accionCerrar,
  carpaOperarioId,
  carpaOperarioNombre,
}: {
  totalInicial: number;
  accionCerrar: () => Promise<void>;
  carpaOperarioId: string | null;
  carpaOperarioNombre: string | null;
}) {
  const [pantalla, setPantalla] = useState<Pantalla>("inicio");
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<FichaEntrega[]>([]);
  const [ficha, setFicha] = useState<FichaEntrega | null>(null);
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [total, setTotal] = useState(totalInicial);
  const [escaneando, setEscaneando] = useState(false);
  const [pending, startTransition] = useTransition();

  function relacionCarpa(f: FichaEntrega): Relacion {
    if (!f.carpaId) return "sin_carpa";
    if (!carpaOperarioId) return "sin_operario";
    return f.carpaId === carpaOperarioId ? "correcta" : "otra";
  }

  function reiniciar() {
    setQ("");
    setResultados([]);
    setFicha(null);
    setConfirmacion(null);
    setAviso(null);
    setPantalla("inicio");
  }

  /**
   * Abre una selección. Si ya fue entregada, va DIRECTO a la pantalla roja
   * completa (evidente a un metro), sin pasar por la ficha; si no, a la ficha.
   */
  function abrirFicha(f: FichaEntrega) {
    setAviso(null);
    if (f.entrega) {
      setConfirmacion({
        beneficiario: f.beneficiario,
        producto: f.producto,
        carpa: f.carpaNombre,
        fueraDeCarpa: false,
        entregadoEn: f.entrega.entregadoEn,
        operarioAnterior: f.entrega.operario,
      });
      setPantalla("ya");
    } else {
      setFicha(f);
      setPantalla("ficha");
    }
  }

  function ejecutarBusqueda(termino: string) {
    setAviso(null);
    startTransition(async () => {
      const r = await buscarEntrega(termino);
      if (r.fichas.length === 0) {
        setAviso("No se encontró ninguna selección con ese dato. Revisa el código o busca por cédula.");
        return;
      }
      if (r.fichas.length === 1) {
        abrirFicha(r.fichas[0]);
      } else {
        setResultados(r.fichas);
        setPantalla("lista");
      }
    });
  }

  function confirmarEntrega(f: FichaEntrega) {
    startTransition(async () => {
      const r = await marcarEntrega(f.codigo);
      if (!r.ok) {
        setAviso(r.error ?? "No se pudo registrar la entrega. Inténtalo de nuevo.");
        return;
      }
      setConfirmacion({
        beneficiario: r.beneficiario,
        producto: r.producto,
        carpa: r.carpa,
        fueraDeCarpa: r.fueraDeCarpa,
        entregadoEn: r.entregadoEn,
        operarioAnterior: r.operarioAnterior,
      });
      if (r.yaEntregado) {
        setPantalla("ya");
      } else {
        setTotal((t) => t + 1);
        setPantalla("exito");
      }
    });
  }

  // ---- Confirmaciones a pantalla completa: la diferencia verde/rojo debe
  //      leerse desde el otro lado de la carpa, sin leer una sola palabra. ----
  if (pantalla === "exito" && confirmacion) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-success p-6 text-center text-success-foreground">
        <CheckCircle2 className="size-28 sm:size-32" aria-hidden />
        <p className="mt-4 text-2xl font-semibold uppercase tracking-wide opacity-90">
          Entregado
        </p>
        <p className="mt-3 max-w-full break-words text-5xl font-extrabold leading-tight">
          {confirmacion.beneficiario}
        </p>
        <p className="mt-4 text-2xl opacity-90">{confirmacion.producto}</p>
        {confirmacion.carpa && (
          <p className="mt-1 text-xl opacity-80">{confirmacion.carpa}</p>
        )}
        {confirmacion.fueraDeCarpa && (
          <p className="mt-4 rounded-lg bg-background/20 px-4 py-2 text-lg font-medium">
            Registrado como entrega fuera de tu carpa
          </p>
        )}
        <Button
          onClick={reiniciar}
          className="mt-10 h-24 w-full max-w-md bg-background text-3xl font-extrabold text-foreground hover:bg-background/90"
        >
          Siguiente
          <ArrowRight className="ml-3 size-8" aria-hidden />
        </Button>
      </div>
    );
  }

  if (pantalla === "ya" && confirmacion) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-destructive p-6 text-center text-destructive-foreground">
        <TriangleAlert className="size-28 sm:size-32" aria-hidden />
        <p className="mt-4 text-3xl font-extrabold uppercase tracking-wide">
          Ya fue entregado
        </p>
        <p className="mt-3 max-w-full break-words text-4xl font-bold leading-tight">
          {confirmacion.beneficiario}
        </p>
        <div className="mt-6 space-y-1 text-xl">
          <p>
            Entregado el{" "}
            <span className="font-semibold">
              {formatearFechaHora(confirmacion.entregadoEn)}
            </span>
          </p>
          <p>
            Operario:{" "}
            <span className="font-semibold">
              {confirmacion.operarioAnterior ?? "—"}
            </span>
          </p>
        </div>
        <Button
          onClick={reiniciar}
          className="mt-10 h-24 w-full max-w-md bg-background text-2xl font-extrabold text-foreground hover:bg-background/90"
        >
          Entendido, siguiente
          <ArrowRight className="ml-3 size-8" aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      {escaneando && (
        <EscanerQr
          onDetectar={(texto) => {
            setEscaneando(false);
            setQ(texto);
            ejecutarBusqueda(texto);
          }}
          onCerrar={() => setEscaneando(false)}
        />
      )}

      {/* Encabezado siempre visible: marcador de la jornada + la carpa del
          operario, el contexto que nunca debe perderse de vista. */}
      <header>
        <div className="flex items-center justify-between px-4 py-3">
          <p className="flex items-baseline gap-2" aria-live="polite">
            <span className="text-3xl font-extrabold tabular-nums text-success">
              {total}
            </span>
            <span className="text-base text-muted-foreground">entregadas hoy</span>
          </p>
          <BotonCerrarSesion accion={accionCerrar} />
        </div>
        {/* Azul marino = contexto estable (tu carpa), distinto del azul de acción. */}
        <div className="flex items-center gap-3 bg-primary-deep px-4 py-3 text-primary-foreground">
          <Tent className="size-7 shrink-0" aria-hidden />
          <div className="min-w-0 leading-tight">
            <p className="text-xs font-medium uppercase tracking-wide opacity-80">
              Tu carpa
            </p>
            <p className="truncate text-xl font-bold">
              {carpaOperarioNombre ?? "Sin carpa asignada"}
            </p>
          </div>
        </div>
        <FranjaMarca />
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        {pantalla === "inicio" && (
          <div className="space-y-5">
            <h1 className="sr-only">Buscar entrega</h1>

            {/* La acción principal es escanear: botón hero, azul de acción. */}
            <button
              type="button"
              onClick={() => setEscaneando(true)}
              className="flex w-full flex-col items-center gap-2 rounded-xl bg-primary px-6 py-8 text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <QrCode className="size-16" aria-hidden />
              <span className="text-2xl font-extrabold">Escanear QR</span>
              <span className="text-sm opacity-90">
                Apunta al código del comprobante
              </span>
            </button>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-px flex-1 bg-border" />o escribe el código
              <span className="h-px flex-1 bg-border" />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) ejecutarBusqueda(q);
              }}
              className="space-y-3"
            >
              <div className="relative">
                <label htmlFor="busqueda" className="sr-only">
                  Código de entrega o cédula
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="busqueda"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Código o cédula"
                  className="h-16 pl-11 text-xl"
                  inputMode="text"
                  autoComplete="off"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="h-16 w-full text-xl font-semibold"
                disabled={pending || !q.trim()}
              >
                {pending ? (
                  <Loader2 className="mr-2 size-6 animate-spin" aria-hidden />
                ) : (
                  <Search className="mr-2 size-6" aria-hidden />
                )}
                Buscar
              </Button>
            </form>

            {aviso && (
              <p
                role="status"
                aria-live="polite"
                className="rounded-lg bg-muted p-4 text-center text-lg font-medium"
              >
                {aviso}
              </p>
            )}
          </div>
        )}

        {pantalla === "lista" && (
          <div className="space-y-4">
            <BotonVolver onClick={reiniciar} />
            <h1 className="text-2xl font-bold">Elige el beneficiario</h1>
            <div className="space-y-3">
              {resultados.map((f) => (
                <button
                  key={f.seleccionId}
                  onClick={() => abrirFicha(f)}
                  className="flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-bold">{f.beneficiario}</p>
                    <p className="truncate text-base text-muted-foreground">
                      {f.carpaNombre ?? "Sin carpa"} · {f.producto}
                    </p>
                  </div>
                  {f.entrega ? (
                    <span className="shrink-0 text-base font-semibold text-destructive">
                      Entregado
                    </span>
                  ) : (
                    <ArrowRight
                      className="size-6 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {pantalla === "ficha" && ficha && (
          <FichaVista
            ficha={ficha}
            relacion={relacionCarpa(ficha)}
            pending={pending}
            aviso={aviso}
            onVolver={reiniciar}
            onConfirmar={() => confirmarEntrega(ficha)}
          />
        )}
      </main>
    </div>
  );
}

/** Volver: enlace-botón con objetivo táctil ≥44px y foco visible. */
function BotonVolver({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="-ml-2 inline-flex h-11 items-center gap-1 rounded-md px-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ChevronLeft className="size-5" aria-hidden />
      Nueva búsqueda
    </button>
  );
}

function FichaVista({
  ficha,
  relacion,
  pending,
  aviso,
  onVolver,
  onConfirmar,
}: {
  ficha: FichaEntrega;
  relacion: Relacion;
  pending: boolean;
  aviso: string | null;
  onVolver: () => void;
  onConfirmar: () => void;
}) {
  const yaEntregado = ficha.entrega !== null;

  return (
    <div className="space-y-5">
      <BotonVolver onClick={onVolver} />

      <div className="text-center">
        <p className="break-words text-4xl font-extrabold leading-tight">
          {ficha.beneficiario}
        </p>
        <p className="mt-1 text-lg text-muted-foreground">{ficha.edad} años</p>
      </div>

      {/* Carpa de la referencia, coloreada según su relación con la del operario. */}
      <BannerCarpa relacion={relacion} nombre={ficha.carpaNombre} />

      <ImagenProducto
        src={ficha.imagenUrl}
        alt={ficha.producto}
        className="mx-auto aspect-square w-56 rounded-xl"
      />
      <p className="text-center text-2xl font-semibold">{ficha.producto}</p>

      {yaEntregado ? (
        <div className="rounded-xl bg-destructive p-5 text-center text-destructive-foreground">
          <TriangleAlert className="mx-auto size-10" aria-hidden />
          <p className="mt-2 text-2xl font-extrabold">Ya fue entregado</p>
          <p className="mt-1 text-lg">
            {formatearFechaHora(ficha.entrega!.entregadoEn)}
            {ficha.entrega!.operario ? ` · ${ficha.entrega!.operario}` : ""}
          </p>
          <Button
            onClick={onVolver}
            className="mt-4 h-16 w-full bg-background text-xl font-bold text-foreground hover:bg-background/90"
          >
            Siguiente
          </Button>
        </div>
      ) : (
        <Button
          onClick={onConfirmar}
          disabled={pending}
          className="h-24 w-full bg-success text-3xl font-extrabold text-success-foreground hover:bg-success/90"
        >
          {pending ? (
            <Loader2 className="mr-3 size-8 animate-spin" aria-hidden />
          ) : (
            <CheckCircle2 className="mr-3 size-9" aria-hidden />
          )}
          Marcar entregado
        </Button>
      )}

      {aviso && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg bg-muted p-4 text-center text-lg font-medium"
        >
          {aviso}
        </p>
      )}
    </div>
  );
}

/** Banner de carpa: el color codifica qué hacer, no la edad. */
function BannerCarpa({
  relacion,
  nombre,
}: {
  relacion: Relacion;
  nombre: string | null;
}) {
  if (relacion === "otra") {
    return (
      <div className="rounded-xl bg-warning px-5 py-4 text-center text-warning-foreground">
        <div className="flex items-center justify-center gap-2">
          <ArrowRight className="size-7 shrink-0" aria-hidden />
          <span className="text-3xl font-extrabold tracking-wide">{nombre}</span>
        </div>
        <p className="mt-2 text-base font-medium">
          Se despacha en otra carpa. Dile a la familia que vaya allá. Si ya está
          aquí y tienes el juguete, puedes entregarlo igual.
        </p>
      </div>
    );
  }

  if (relacion === "sin_carpa") {
    return (
      <div className="rounded-xl bg-destructive px-5 py-4 text-center text-destructive-foreground">
        <TriangleAlert className="mx-auto size-9" aria-hidden />
        <p className="mt-2 text-2xl font-bold">Sin carpa asignada</p>
        <p className="mt-1 text-base">
          Este juguete no está asignado a ninguna carpa. Avisa a administración;
          puedes entregarlo si lo tienes a mano.
        </p>
      </div>
    );
  }

  // correcta = verde (entrégalo aquí) · sin_operario = azul marino (contexto)
  const esCorrecta = relacion === "correcta";
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-6 py-4 text-center",
        esCorrecta
          ? "bg-success text-success-foreground"
          : "bg-primary-deep text-primary-foreground",
      )}
    >
      {esCorrecta && (
        <span className="text-sm font-semibold uppercase tracking-wide opacity-90">
          Entrégalo aquí
        </span>
      )}
      <span className="flex items-center gap-2">
        <Tent className="size-8 shrink-0" aria-hidden />
        <span className="text-3xl font-extrabold tracking-wide">
          {nombre ?? "Sin carpa"}
        </span>
      </span>
    </div>
  );
}
