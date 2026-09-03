/**
 * Fuentes curadas del panel de temas. Cada una se carga con next/font/google
 * en el layout raíz y expone una variable CSS; el token de fuente guarda el
 * nombre y se resuelve a su variable (así el selector no miente: la fuente que
 * eliges es la que se ve).
 *
 * Geist no está en next/font/google (requiere el paquete `geist`); se omite en
 * el piloto para no traer una dependencia extra ni ofrecer un font que caiga a
 * fallback en silencio. Ver PROGRESO.md.
 */
export interface FuenteCurada {
  nombre: string;
  variable: string;
}

export const CURATED_FONTS: FuenteCurada[] = [
  { nombre: "Montserrat", variable: "--font-montserrat" },
  { nombre: "Inter", variable: "--font-inter" },
  { nombre: "Manrope", variable: "--font-manrope" },
  { nombre: "Plus Jakarta Sans", variable: "--font-jakarta" },
  { nombre: "Source Sans 3", variable: "--font-source-sans" },
  { nombre: "Nunito Sans", variable: "--font-nunito" },
  { nombre: "Outfit", variable: "--font-outfit" },
  { nombre: "Figtree", variable: "--font-figtree" },
];

const POR_NOMBRE = new Map(CURATED_FONTS.map((f) => [f.nombre, f]));

/** Familia CSS completa para un nombre curado, o null si no está en la lista. */
export function familiaDeFuente(nombre: string): string | null {
  const f = POR_NOMBRE.get(nombre);
  if (!f) return null;
  return `var(${f.variable}), ui-sans-serif, system-ui, sans-serif`;
}
