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
  PackageCheck,
  Tent,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { EscanerQr } from "./escaner-qr";
import { buscarEntrega, marcarEntrega } from "@/app/entrega/acciones";
import { formatearFechaHora } from "@/lib/format";
import type { FichaEntrega } from "@/lib/entrega/datos";

const PLACEHOLDER = "https://placehold.co/600x600/EEE/31343C?text=Juguete";

type Pantalla = "inicio" | "lista" | "ficha" | "exito" | "ya";

interface Confirmacion {
  beneficiario: string;
  producto: string;
  carpa: string | null;
  fueraDeCarpa: boolean;
  entregadoEn: string | null;
  operarioAnterior: string | null;
}

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

  // Relación entre la carpa de la referencia y la carpa del operario.
  type Relacion = "correcta" | "otra" | "sin_carpa" | "sin_operario";
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

  function ejecutarBusqueda(termino: string) {
    setAviso(null);
    startTransition(async () => {
      const r = await buscarEntrega(termino);
      if (r.fichas.length === 0) {
        setAviso("No se encontró ninguna selección con ese dato.");
        return;
      }
      if (r.fichas.length === 1) {
        setFicha(r.fichas[0]);
        setPantalla("ficha");
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
        setAviso(r.error ?? "No se pudo registrar la entrega.");
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

  // ---- Confirmaciones a pantalla completa (legibles a un metro) ----
  if (pantalla === "exito" && confirmacion) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-success p-6 text-center text-success-foreground">
        <CheckCircle2 className="size-24" aria-hidden />
        <p className="mt-4 text-2xl font-medium opacity-90">Entregado</p>
        <p className="mt-2 text-5xl font-bold leading-tight">{confirmacion.beneficiario}</p>
        <p className="mt-4 text-2xl opacity-90">{confirmacion.producto}</p>
        {confirmacion.carpa && (
          <p className="mt-1 text-xl opacity-80">{confirmacion.carpa}</p>
        )}
        {confirmacion.fueraDeCarpa && (
          <p className="mt-4 rounded-md bg-background/20 px-4 py-2 text-lg font-medium">
            Registrado como entrega fuera de tu carpa
          </p>
        )}
        <Button
          onClick={reiniciar}
          className="mt-10 h-20 w-full max-w-md bg-background text-2xl font-bold text-foreground hover:bg-background/90"
        >
          Siguiente
          <ArrowRight className="ml-3 size-7" aria-hidden />
        </Button>
      </div>
    );
  }

  if (pantalla === "ya" && confirmacion) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-destructive p-6 text-center text-destructive-foreground">
        <TriangleAlert className="size-24" aria-hidden />
        <p className="mt-4 text-3xl font-bold">Este regalo YA fue entregado</p>
        <p className="mt-4 text-4xl font-bold leading-tight">{confirmacion.beneficiario}</p>
        <div className="mt-6 space-y-1 text-xl">
          <p>
            Entregado el{" "}
            <span className="font-semibold">{formatearFechaHora(confirmacion.entregadoEn)}</span>
          </p>
          <p>
            Operario: <span className="font-semibold">{confirmacion.operarioAnterior ?? "—"}</span>
          </p>
        </div>
        <Button
          onClick={reiniciar}
          className="mt-10 h-20 w-full max-w-md bg-background text-2xl font-bold text-foreground hover:bg-background/90"
        >
          Entendido, siguiente
          <ArrowRight className="ml-3 size-7" aria-hidden />
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

      {/* Contador de la jornada + carpa en la que trabaja el operario (siempre visible) */}
      <header className="border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-lg">
            <PackageCheck className="size-5 text-success" aria-hidden />
            <span className="font-bold tabular-nums">{total}</span>
            <span className="text-muted-foreground">entregadas</span>
          </div>
          <BotonCerrarSesion accion={accionCerrar} />
        </div>
        <div className="flex items-center gap-2 bg-primary px-4 py-2 text-primary-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden />
          <span className="text-sm">Estás en:</span>
          <span className="font-bold">{carpaOperarioNombre ?? "Sin carpa asignada"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6">
        {pantalla === "inicio" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Buscar entrega</h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) ejecutarBusqueda(q);
              }}
              className="space-y-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-4 size-5 text-muted-foreground" aria-hidden />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Código o cédula"
                  autoFocus
                  className="h-14 pl-11 text-lg"
                  inputMode="text"
                />
              </div>
              <Button type="submit" className="h-14 w-full text-lg" disabled={pending || !q.trim()}>
                {pending ? (
                  <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
                ) : (
                  <Search className="mr-2 size-5" aria-hidden />
                )}
                Buscar
              </Button>
            </form>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              o
              <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="h-16 w-full text-lg" onClick={() => setEscaneando(true)}>
              <QrCode className="mr-2 size-6" aria-hidden />
              Escanear QR
            </Button>

            {aviso && <p className="rounded-md bg-muted p-3 text-center text-lg">{aviso}</p>}
          </div>
        )}

        {pantalla === "lista" && (
          <div className="space-y-4">
            <button onClick={reiniciar} className="flex items-center text-muted-foreground">
              <ChevronLeft className="size-5" aria-hidden />
              Nueva búsqueda
            </button>
            <h1 className="text-xl font-bold">Elige el beneficiario</h1>
            <div className="space-y-3">
              {resultados.map((f) => (
                <button
                  key={f.seleccionId}
                  onClick={() => {
                    setFicha(f);
                    setPantalla("ficha");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg border p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold">{f.beneficiario}</p>
                    <p className="text-sm text-muted-foreground">
                      {f.carpaNombre ?? "Sin carpa"} · {f.producto}
                    </p>
                  </div>
                  {f.entrega ? (
                    <span className="shrink-0 text-sm font-medium text-destructive">Entregado</span>
                  ) : (
                    <ArrowRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
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

function FichaVista({
  ficha,
  relacion,
  pending,
  aviso,
  onVolver,
  onConfirmar,
}: {
  ficha: FichaEntrega;
  relacion: "correcta" | "otra" | "sin_carpa" | "sin_operario";
  pending: boolean;
  aviso: string | null;
  onVolver: () => void;
  onConfirmar: () => void;
}) {
  const yaEntregado = ficha.entrega !== null;

  return (
    <div className="space-y-5">
      <button onClick={onVolver} className="flex items-center text-muted-foreground">
        <ChevronLeft className="size-5" aria-hidden />
        Nueva búsqueda
      </button>

      <div className="text-center">
        <p className="text-3xl font-bold leading-tight">{ficha.beneficiario}</p>
        <p className="mt-1 text-lg text-muted-foreground">{ficha.edad} años</p>
      </div>

      {/* Carpa de la referencia, con el color según corresponda a la del operario */}
      {relacion === "correcta" && (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-success px-6 py-4 text-success-foreground">
          <Tent className="size-8" aria-hidden />
          <span className="text-3xl font-extrabold tracking-wide">{ficha.carpaNombre}</span>
        </div>
      )}
      {relacion === "otra" && (
        <div className="rounded-xl bg-warning px-5 py-4 text-center text-warning-foreground">
          <div className="flex items-center justify-center gap-2">
            <ArrowRight className="size-7" aria-hidden />
            <span className="text-3xl font-extrabold tracking-wide">{ficha.carpaNombre}</span>
          </div>
          <p className="mt-2 text-base font-medium">
            Este juguete se despacha en otra carpa. Indícale a la familia que vaya allá.
            Si ya está aquí y tienes el juguete, puedes entregarlo igual.
          </p>
        </div>
      )}
      {relacion === "sin_operario" && (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-primary-foreground">
          <Tent className="size-8" aria-hidden />
          <span className="text-3xl font-extrabold tracking-wide">
            {ficha.carpaNombre ?? "Sin carpa"}
          </span>
        </div>
      )}
      {relacion === "sin_carpa" && (
        <div className="rounded-xl bg-destructive px-5 py-4 text-center text-destructive-foreground">
          <TriangleAlert className="mx-auto size-8" aria-hidden />
          <p className="mt-2 text-xl font-bold">Sin carpa asignada</p>
          <p className="mt-1 text-base">
            Este juguete no está asignado a ninguna carpa. Avisa a administración; puedes
            entregarlo si lo tienes a mano.
          </p>
        </div>
      )}

      <img
        src={ficha.imagenUrl ?? PLACEHOLDER}
        alt={ficha.producto}
        className="mx-auto aspect-square w-56 rounded-lg bg-muted object-cover"
      />
      <p className="text-center text-xl font-semibold">{ficha.producto}</p>

      {yaEntregado ? (
        <div className="rounded-lg bg-destructive p-4 text-center text-destructive-foreground">
          <TriangleAlert className="mx-auto size-8" aria-hidden />
          <p className="mt-2 text-xl font-bold">Ya fue entregado</p>
          <p className="mt-1">
            {formatearFechaHora(ficha.entrega!.entregadoEn)}
            {ficha.entrega!.operario ? ` · ${ficha.entrega!.operario}` : ""}
          </p>
          <Button
            onClick={onVolver}
            className="mt-4 h-14 w-full bg-background text-lg text-foreground hover:bg-background/90"
          >
            Siguiente
          </Button>
        </div>
      ) : (
        <Button
          onClick={onConfirmar}
          disabled={pending}
          className="h-20 w-full bg-success text-2xl font-bold text-success-foreground hover:bg-success/90"
        >
          {pending ? (
            <Loader2 className="mr-2 size-7 animate-spin" aria-hidden />
          ) : (
            <CheckCircle2 className="mr-3 size-8" aria-hidden />
          )}
          Marcar entregado
        </Button>
      )}

      {aviso && <p className="rounded-md bg-muted p-3 text-center text-lg">{aviso}</p>}
    </div>
  );
}
