import { Tent, TriangleAlert, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ResumenEntregas, CarpaResumen } from "@/lib/kidotoy/entregas";

/**
 * Mapa de la jornada — avance por carpa. No es un listado: se lee como un mapa
 * para decir DÓNDE MANDAR REFUERZO.
 *
 * OJO con el color: NO codifica avance absoluto (a las 9 a. m. todo va bajo y eso
 * es normal, no un problema). El color se enciende solo cuando una carpa está
 * SIGNIFICATIVAMENTE por debajo del promedio de la jornada — la señal real de
 * rezago —, y no antes de que haya avance suficiente para comparar. Etiqueta
 * distinta a la del heatmap de inventario ("atrasada", no "no alcanza").
 */
type EstadoCarpa = "neutro" | "atrasada" | "muy_atrasada";

function avanceDe(c: CarpaResumen) {
  return c.confirmadas > 0 ? (100 * c.entregadas) / c.confirmadas : 100;
}

function Tile({
  c,
  estado,
}: {
  c: CarpaResumen;
  estado: EstadoCarpa;
}) {
  const pct = Math.round(avanceDe(c));
  const tile =
    estado === "muy_atrasada"
      ? "border-destructive/50 bg-destructive/10"
      : estado === "atrasada"
        ? "border-warning/50 bg-warning/15"
        : "border-border bg-card";
  return (
    <div className={cn("rounded-md border p-3", tile)}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 font-semibold text-foreground">
          <Tent className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{c.carpaNombre}</span>
        </span>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {pct}%
        </span>
      </div>
      <Progress value={pct} className="mt-2 h-2" />
      <div className="mt-2 flex items-center justify-between gap-2 text-sm">
        <span className="tabular-nums text-muted-foreground">
          {c.entregadas}/{c.confirmadas} · {c.pendientes} por entregar
        </span>
        {estado === "muy_atrasada" && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-destructive">
            <TriangleAlert className="size-3.5" aria-hidden />
            Refuerzo
          </span>
        )}
        {estado === "atrasada" && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-warning">
            <ArrowDownRight className="size-3.5" aria-hidden />
            Atrasada
          </span>
        )}
      </div>
    </div>
  );
}

export function RejillaCarpas({ resumen }: { resumen: ResumenEntregas }) {
  const promedio = resumen.porcentaje;
  // Solo se puede hablar de "rezago" cuando la jornada ya avanzó lo suficiente.
  const comparable = promedio >= 15 && resumen.entregadas >= resumen.porCarpa.length;

  function estadoDe(c: CarpaResumen): EstadoCarpa {
    if (!comparable || c.confirmadas === 0) return "neutro";
    const rezago = promedio - avanceDe(c);
    if (rezago >= 20) return "muy_atrasada";
    if (rezago >= 10) return "atrasada";
    return "neutro";
  }

  return (
    <section aria-label="Avance por carpa">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">
            Avance por carpa
          </h2>
          <p className="max-w-2xl text-xs text-muted-foreground">
            {comparable
              ? "El color marca las carpas por debajo del promedio de la jornada (dónde mandar refuerzo), no el avance absoluto."
              : "Aún no hay avance suficiente para comparar carpas; el color aparece cuando la jornada arranca."}
          </p>
        </div>
        <p className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
          Promedio {Math.round(promedio)}%
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.porCarpa.map((c) => (
          <Tile key={c.carpaId ?? "sin"} c={c} estado={estadoDe(c)} />
        ))}
      </div>
    </section>
  );
}
