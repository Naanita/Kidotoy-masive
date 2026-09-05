import type { DiaEvolucion } from "@/lib/kidotoy/datos";

/**
 * Evolución de la campaña: % confirmado acumulado por día. Gráfica de TRABAJO —
 * legible antes que elegante, sin adornos. SVG a mano, sin dependencias, colores
 * por tokens.
 */
export function GraficaEvolucion({
  dias,
}: {
  dias: DiaEvolucion[];
}) {
  if (dias.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aún no hay confirmaciones para graficar.
      </p>
    );
  }

  const W = 320;
  const H = 120;
  const padB = 16;
  const padL = 2;
  const n = dias.length;
  const px = (i: number) =>
    n === 1 ? W / 2 : padL + (i / (n - 1)) * (W - padL);
  const py = (pct: number) => H - padB - (pct / 100) * (H - padB - 6);
  const puntos = dias.map((d, i) => `${px(i)},${py(d.pct)}`).join(" ");
  const area = `${px(0)},${H - padB} ${puntos} ${px(n - 1)},${H - padB}`;
  const actual = dias[n - 1].pct;

  const fmt = (f: string) =>
    new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "short",
      timeZone: "America/Bogota",
    }).format(new Date(`${f}T12:00:00`));

  return (
    <div>
      <div className="mb-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {actual}%
        </span>
        <span className="text-xs text-muted-foreground">confirmado a hoy</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Evolución de la campaña: ${actual}% confirmado`}
      >
        <line
          x1={px(0)}
          y1={H - padB}
          x2={W}
          y2={H - padB}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        <polygon points={area} fill="hsl(var(--primary))" fillOpacity={0.1} />
        <polyline
          points={puntos}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle
          cx={px(n - 1)}
          cy={py(actual)}
          r={3}
          fill="hsl(var(--primary))"
        />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{fmt(dias[0].fecha)}</span>
        <span>{fmt(dias[n - 1].fecha)}</span>
      </div>
    </div>
  );
}
