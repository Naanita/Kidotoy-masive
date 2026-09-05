import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const PASOS = ["Beneficiarios", "Elegir regalo", "Confirmación", "Comprobante"];

/**
 * Barra de pasos del flujo del colaborador (DESIGN §4). Círculos numerados
 * unidos por una línea: completados en azul con verificación, el actual en azul
 * con anillo, pendientes en gris. Etiqueta bajo cada paso en escritorio; en
 * móvil solo la del paso actual.
 */
export function Stepper({ actual }: { actual: 1 | 2 | 3 | 4 }) {
  return (
    <nav aria-label="Progreso del proceso">
      <ol className="flex items-start">
        {PASOS.map((label, i) => {
          const paso = i + 1;
          const completado = paso < actual;
          const esActual = paso === actual;
          const lineaIzqActiva = paso <= actual; // segmento entrante
          const lineaDerActiva = paso < actual; // segmento saliente
          return (
            <li key={label} className="flex flex-1 flex-col items-center last:flex-none">
              <div className="flex w-full items-center">
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    i === 0 ? "invisible" : lineaIzqActiva ? "bg-primary" : "bg-border",
                  )}
                />
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                    completado && "bg-primary text-primary-foreground",
                    esActual && "bg-primary text-primary-foreground ring-4 ring-primary/25",
                    !completado && !esActual && "bg-secondary text-muted-foreground ring-1 ring-inset ring-border",
                  )}
                >
                  {completado ? <Check className="size-4" aria-hidden /> : paso}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    i === PASOS.length - 1 ? "invisible" : lineaDerActiva ? "bg-primary" : "bg-border",
                  )}
                />
              </div>
              <span
                className={cn(
                  "mt-1.5 px-1 text-center text-xs leading-tight",
                  esActual ? "font-semibold text-foreground" : "text-muted-foreground",
                  esActual ? "inline" : "hidden sm:inline",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
