import { cn } from "@/lib/utils";

/**
 * Destellos regados del keyvisual: pequeñas estrellas de cuatro puntas en los
 * colores de marca, en momentos de alegría (bienvenida, confirmación). Overlay
 * decorativo que no captura eventos. El parpadeo es sutil y se apaga con
 * prefers-reduced-motion (motion-safe + reset global en globals.css).
 */
const ESTRELLAS = [
  { x: "8%", y: "18%", s: 22, c: "text-kido-amarillo", d: "0ms" },
  { x: "22%", y: "72%", s: 14, c: "text-kido-turquesa", d: "300ms" },
  { x: "42%", y: "12%", s: 16, c: "text-kido-rojo", d: "700ms" },
  { x: "68%", y: "22%", s: 20, c: "text-kido-morado", d: "150ms" },
  { x: "82%", y: "64%", s: 16, c: "text-kido-amarillo", d: "500ms" },
  { x: "92%", y: "30%", s: 12, c: "text-kido-turquesa", d: "900ms" },
  { x: "58%", y: "80%", s: 14, c: "text-kido-morado", d: "200ms" },
];

export function Destellos({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {ESTRELLAS.map((e, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={cn("absolute opacity-70 motion-safe:animate-pulse", e.c)}
          style={{
            left: e.x,
            top: e.y,
            width: e.s,
            height: e.s,
            animationDelay: e.d,
            animationDuration: "2.4s",
          }}
        >
          <path d="M12 0c1 7.2 3.8 10 11 12-7.2 1-10 3.8-11 11-1-7.2-3.8-10-11-11 7.2-1 10-3.8 11-12Z" />
        </svg>
      ))}
    </div>
  );
}
