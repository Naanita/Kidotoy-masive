import { cn } from "@/lib/utils";

/**
 * La nube blanca del keyvisual que sostiene el logo. Es el corazón del keyvisual
 * Kidotoy; va detrás del lockup en login y bienvenida. Decorativa (aria-hidden).
 * Por defecto blanca; sobre el turquesa de marca queda como en el manual, pero
 * también sirve como superficie clara sobre cualquier fondo.
 */
export function NubeMarca({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 150"
      aria-hidden
      className={cn("text-card", className)}
      fill="currentColor"
    >
      <g>
        <circle cx="78" cy="82" r="42" />
        <circle cx="122" cy="58" r="50" />
        <circle cx="170" cy="80" r="40" />
        <circle cx="132" cy="98" r="44" />
        <rect x="60" y="88" width="128" height="46" rx="23" />
      </g>
    </svg>
  );
}
