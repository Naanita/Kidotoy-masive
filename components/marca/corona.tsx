import { cn } from "@/lib/utils";

/**
 * La corona del imagotipo Kidotoy (el símbolo sobre la "o"). Marca los momentos
 * de logro: "¡Regalo confirmado!", comprobante. Amarillo de marca por defecto.
 * Decorativa: siempre acompaña texto que ya comunica el logro.
 */
export function CoronaMarca({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 92"
      aria-hidden
      className={cn("text-kido-amarillo", className)}
      fill="currentColor"
    >
      <path d="M18 80 L10 34 C10 31 13 29 16 31 L38 50 L56 16 C58 12 62 12 64 16 L82 50 L104 31 C107 29 110 31 110 34 L102 80 C101 84 98 86 94 86 L26 86 C22 86 19 84 18 80 Z" />
      <circle cx="10" cy="28" r="7" />
      <circle cx="60" cy="10" r="7" />
      <circle cx="110" cy="28" r="7" />
    </svg>
  );
}
