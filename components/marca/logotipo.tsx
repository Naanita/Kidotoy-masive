import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Logotipo de Kidotoy: wordmark de identidad de marca.
 *
 * Sus colores son FIJOS a propósito — son la identidad de Kidotoy, no tokens del
 * tema. Igual que el QR, es una excepción deliberada a "todo por tokens": un logo
 * no debe recolorearse cuando se cambia el color primario desde /dev/tema.
 *
 * Nota de producción: reemplazar por el logo vectorial oficial de Kidotoy cuando
 * se tenga el asset. El de Acueducto (rana + "Agua y Alcantarillado de Bogotá")
 * es del cliente y debe entregarlo el cliente; aquí va como texto de marcador.
 */
const COLORES_KIDOTOY = [
  "#007BFF", // k
  "#7E57C2", // i
  "#FF4D4F", // d
  "#FFC107", // o
  "#00C9A7", // t
  "#1361C5", // o
  "#7E57C2", // y
];

export function MarcaKidotoy({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-center font-heading text-2xl font-extrabold tracking-tight",
        className,
      )}
      aria-label="Kidotoy"
    >
      <Crown
        className="mr-[0.1em] size-[0.72em] -translate-y-[0.28em]"
        style={{ color: "#FFC107", fill: "#FFC107" }}
        aria-hidden
      />
      {"kidotoy".split("").map((letra, i) => (
        <span key={i} style={{ color: COLORES_KIDOTOY[i] }}>
          {letra}
        </span>
      ))}
    </span>
  );
}

/**
 * Lockup co-marca Acueducto | Kidotoy para encabezados y logins.
 * "acueducto" va como texto de marcador hasta tener el logo oficial del cliente.
 */
export function LockupMarca({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="font-heading text-lg font-bold lowercase tracking-tight text-primary">
        acueducto
      </span>
      <span aria-hidden className="text-xl font-light text-border">
        |
      </span>
      <MarcaKidotoy className="text-lg" />
    </span>
  );
}
