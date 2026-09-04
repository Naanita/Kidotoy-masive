import { cn } from "@/lib/utils";

/**
 * Indicador de disponibilidad en vivo: punto verde pulsante + texto.
 * El anillo pulsante se oculta con prefers-reduced-motion (DESIGN §7).
 */
export function IndicadorVivo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <span className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75 motion-reduce:hidden" />
        <span className="relative inline-flex size-2.5 rounded-full bg-success" />
      </span>
      La disponibilidad se actualiza en tiempo real
    </span>
  );
}
