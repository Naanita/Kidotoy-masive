import { cn } from "@/lib/utils";

/**
 * Avatar de iniciales con color estable derivado del nombre.
 *
 * NUNCA se usan fotos de los niños (son menores, no tenemos esos datos y no se
 * van a pedir). Los colores son decorativos y de una paleta fija —excepción
 * deliberada a "todo por tokens", como el logo—: no deben cambiar con el tema
 * para que un mismo niño mantenga siempre su color.
 */
const PALETA = [
  "211 90% 45%",
  "172 66% 38%",
  "262 47% 52%",
  "32 90% 46%",
  "338 62% 52%",
  "142 55% 38%",
];

function hashNombre(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function AvatarInicial({
  nombre,
  className,
}: {
  nombre: string;
  className?: string;
}) {
  const iniciales =
    nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?";
  const color = PALETA[hashNombre(nombre) % PALETA.length];
  return (
    <span
      aria-hidden
      style={{ backgroundColor: `hsl(${color})` }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold leading-none text-white",
        className,
      )}
    >
      {iniciales}
    </span>
  );
}
