"use client";

import { useState } from "react";
import { TriangleAlert, CheckCircle2, Clock, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Cobertura,
  CoberturaGrupo,
  EstadoCobertura,
} from "@/lib/kidotoy/datos";

/**
 * Mapa de calor de COBERTURA por edad y género — la pieza más específica del
 * panel. Condensado a propósito: las 28 celdas de producción (14 edades × 2)
 * caben en una pantalla SIN scroll, porque un mapa que exige recorrer dejó de
 * ser mapa. La celda da lo esencial (color + cifra clave); el detalle se pide
 * tocándola y aparece en el panel lateral.
 *
 * El color dice si el stock ALCANZA para los que faltan por elegir (cobertura),
 * no la disponibilidad de una referencia. Cada celda lleva ícono de estado, y las
 * tonalidades escalan por intensidad además del matiz (daltonismo).
 */
const ESTILO: Record<
  EstadoCobertura,
  { tile: string; texto: string; label: string; Icon: typeof CheckCircle2 }
> = {
  completo: {
    tile: "bg-muted border-border hover:bg-muted",
    texto: "text-muted-foreground",
    label: "Listo",
    Icon: CheckCircle2,
  },
  suficiente: {
    tile: "bg-success/10 border-success/30 hover:bg-success/20",
    texto: "text-success",
    label: "Suficiente",
    Icon: CheckCircle2,
  },
  ajustado: {
    tile: "bg-warning/25 border-warning/50 hover:bg-warning/35",
    texto: "text-warning",
    label: "Ajustado",
    Icon: Clock,
  },
  critico: {
    tile: "bg-destructive/25 border-destructive/60 hover:bg-destructive/35",
    texto: "text-destructive",
    label: "No alcanza",
    Icon: TriangleAlert,
  },
  sin_referencias: {
    tile: "bg-muted/40 border-muted-foreground/30 border-dashed hover:bg-muted/60",
    texto: "text-muted-foreground",
    label: "Sin referencias",
    Icon: Ban,
  },
};

function Muestra({ estado }: { estado: EstadoCobertura }) {
  const e = ESTILO[estado];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn("size-3 rounded-sm border", e.tile.split(" ")[0], e.tile.split(" ")[1])}
        aria-hidden
      />
      {e.label}
    </span>
  );
}

export function RejillaCobertura({ cobertura }: { cobertura: Cobertura }) {
  const { grupos, actualizadoEn } = cobertura;
  const edades = [...new Set(grupos.map((g) => g.edad))].sort((a, b) => a - b);
  const buscar = (edad: number, genero: string) =>
    grupos.find((g) => g.edad === edad && g.genero === genero);

  // Detalle inicial = el grupo más urgente (primer crítico), o el primero.
  const [sel, setSel] = useState<CoberturaGrupo | null>(
    () =>
      grupos.find((g) => g.estado === "critico") ??
      grupos.find((g) => g.referencias > 0) ??
      grupos[0] ??
      null,
  );

  const hora = new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date(actualizadoEn));

  function Celda({ g }: { g?: CoberturaGrupo }) {
    if (!g) {
      return (
        <div className="rounded border border-dashed bg-muted/20" aria-hidden />
      );
    }
    const e = ESTILO[g.estado];
    const activo = sel?.edad === g.edad && sel?.genero === g.genero;
    return (
      <button
        type="button"
        onClick={() => setSel(g)}
        title={`${g.edad} años · ${g.genero}: ${g.disponibles} disponibles, ${g.pendientes} por elegir — ${e.label}`}
        className={cn(
          "flex items-center justify-between gap-1 rounded border px-2 py-1 text-left transition-colors",
          e.tile,
          activo && "ring-2 ring-primary ring-offset-1",
        )}
      >
        <span className="text-sm font-bold tabular-nums text-foreground">
          {g.estado === "sin_referencias" ? "—" : g.disponibles}
        </span>
        <e.Icon className={cn("size-3.5 shrink-0", e.texto)} aria-hidden />
      </button>
    );
  }

  const deficit = sel ? sel.pendientes - sel.disponibles : 0;

  return (
    <section aria-label="Cobertura por edad y género">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Cobertura por edad y género
          </h2>
          <p className="max-w-2xl text-xs text-muted-foreground">
            El color indica si el stock <strong>alcanza para los que faltan por
            elegir</strong> (cobertura), no la disponibilidad de una referencia.
            El número es el stock disponible; toca una celda para el detalle.
          </p>
        </div>
        <p className="whitespace-nowrap text-xs text-muted-foreground">
          Actualizado a las {hora}
        </p>
      </div>

      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
        <Muestra estado="suficiente" />
        <Muestra estado="ajustado" />
        <Muestra estado="critico" />
        <Muestra estado="completo" />
        <Muestra estado="sin_referencias" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        {/* Matriz condensada */}
        <div className="grid grid-cols-[2.25rem_1fr_1fr] gap-1">
          <div />
          <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Niño
          </div>
          <div className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Niña
          </div>
          {edades.map((edad) => (
            <div key={edad} className="contents">
              <div className="flex items-center justify-end pr-1 text-xs font-semibold tabular-nums text-foreground">
                {edad}
              </div>
              <Celda g={buscar(edad, "Niño")} />
              <Celda g={buscar(edad, "Niña")} />
            </div>
          ))}
        </div>

        {/* Panel de detalle (el detalle se pide) */}
        <aside className="rounded-md border bg-card p-4">
          {sel ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Detalle del grupo
              </p>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
                {sel.edad} años · {sel.genero}
                {(() => {
                  const e = ESTILO[sel.estado];
                  return (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold",
                        e.texto,
                      )}
                    >
                      <e.Icon className="size-3.5" aria-hidden />
                      {e.label}
                    </span>
                  );
                })()}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Disponibles</dt>
                  <dd className="font-semibold tabular-nums">
                    {sel.disponibles}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Por elegir</dt>
                  <dd className="font-semibold tabular-nums">
                    {sel.pendientes}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Referencias</dt>
                  <dd className="font-semibold tabular-nums">
                    {sel.referencias}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Beneficiarios</dt>
                  <dd className="font-semibold tabular-nums">
                    {sel.beneficiarios}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">
                {sel.referencias === 0
                  ? sel.pendientes > 0
                    ? `Este grupo NO tiene referencias asignadas y ${sel.pendientes} beneficiario(s) esperan: no pueden elegir. Asigna juguetes para ${sel.edad} años · ${sel.genero}.`
                    : `Sin referencias asignadas. Aún no hay beneficiarios en este grupo; en producción necesita 6 opciones para ${sel.edad} años · ${sel.genero}.`
                  : deficit > 0
                    ? `Faltan ${deficit} unidades para cubrir a los que aún deben elegir.`
                    : sel.pendientes === 0
                      ? "Todos los de este grupo ya eligieron."
                      : "El stock cubre la demanda actual."}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Toca una celda para ver el detalle del grupo.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
