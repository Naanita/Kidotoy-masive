/**
 * Utilidades de color para el panel de temas. Los tokens de color se guardan
 * como canales HSL "H S% L%" (convención shadcn); el panel edita en hexadecimal.
 */

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

/** "H S% L%" → {h,s,l}. Devuelve null si no calza. */
export function parseHsl(valor: string): Hsl | null {
  const m = /^(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/.exec(
    valor.trim(),
  );
  if (!m) return null;
  return { h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) };
}

/** {h,s,l} → "H S% L%" (redondeado). */
export function formatHsl({ h, s, l }: Hsl): string {
  const r = (n: number) => Math.round(n * 10) / 10;
  return `${r(h)} ${r(s)}% ${r(l)}%`;
}

export function hexToHsl(hex: string): Hsl | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** "H S% L%" → hex (para pintar el selector). "" si no calza. */
export function hslStringToHex(valor: string): string {
  const hsl = parseHsl(valor);
  return hsl ? hslToHex(hsl) : "";
}

/** Luminancia relativa (WCAG) de un HSL. */
function luminancia({ h, s, l }: Hsl): number {
  const hex = hslToHex({ h, s, l }).slice(1);
  const int = parseInt(hex, 16);
  const canal = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = canal((int >> 16) & 255);
  const g = canal((int >> 8) & 255);
  const b = canal(int & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste WCAG entre dos colores "H S% L%". */
export function contraste(a: string, b: string): number {
  const ha = parseHsl(a);
  const hb = parseHsl(b);
  if (!ha || !hb) return 0;
  const la = luminancia(ha);
  const lb = luminancia(hb);
  const claro = Math.max(la, lb);
  const oscuro = Math.min(la, lb);
  return Math.round(((claro + 0.05) / (oscuro + 0.05)) * 100) / 100;
}

/** Texto legible (blanco o casi negro) sobre un fondo dado. */
export function foregroundLegible(fondo: string): string {
  const hsl = parseHsl(fondo);
  if (!hsl) return "0 0% 100%";
  return luminancia(hsl) > 0.4 ? "240 10% 4%" : "0 0% 100%";
}
