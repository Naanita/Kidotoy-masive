/**
 * Lista blanca de tokens de diseño y sus validadores.
 *
 * Esto es una frontera de seguridad, no una preferencia de estilo. Los valores
 * vienen de la base de datos (tabla `tema`) y terminan dentro de un <style> en
 * el layout raíz. Sin validación estricta es un vector de inyección de CSS.
 *
 * Dos defensas:
 *  1. La CLAVE solo puede ser una de las de TOKEN_SPECS (constante del código).
 *     Un atacante no puede inventar `x: red } body { display:none`.
 *  2. El VALOR debe pasar el validador de su tipo (regex + rangos acotados).
 *
 * Convención: las claves NO llevan el prefijo `--`; se agrega al serializar.
 */

import { familiaDeFuente } from "./fonts";

export type TokenType =
  | "color"
  | "length"
  | "number"
  | "fontFamily"
  | "fontWeight"
  | "url"
  | "text";

export interface TokenSpec {
  type: TokenType;
  min?: number;
  max?: number;
}

export const TOKEN_SPECS: Record<string, TokenSpec> = {
  // ---- Color (canales HSL "H S% L%") ----
  background: { type: "color" },
  foreground: { type: "color" },
  card: { type: "color" },
  "card-foreground": { type: "color" },
  popover: { type: "color" },
  "popover-foreground": { type: "color" },
  primary: { type: "color" },
  "primary-foreground": { type: "color" },
  secondary: { type: "color" },
  "secondary-foreground": { type: "color" },
  muted: { type: "color" },
  "muted-foreground": { type: "color" },
  accent: { type: "color" },
  "accent-foreground": { type: "color" },
  destructive: { type: "color" },
  "destructive-foreground": { type: "color" },
  success: { type: "color" },
  "success-foreground": { type: "color" },
  warning: { type: "color" },
  "warning-foreground": { type: "color" },
  border: { type: "color" },
  input: { type: "color" },
  ring: { type: "color" },

  // ---- Tipografía ----
  "font-heading": { type: "fontFamily" },
  "font-body": { type: "fontFamily" },
  "font-size-base": { type: "length", min: 12, max: 24 },
  "font-scale": { type: "number", min: 1, max: 1.6 },
  "font-weight-heading": { type: "fontWeight" },

  // ---- Forma y espacio ----
  radius: { type: "length", min: 0, max: 24 },
  "spacing-unit": { type: "length", min: 0, max: 12 },
  density: { type: "number", min: 0.75, max: 1.25 },
  "shadow-level": { type: "number", min: 0, max: 0.3 },

  // ---- Marca ----
  "logo-url": { type: "url" },
  "logo-dark-url": { type: "url" },
  "favicon-url": { type: "url" },
  "marca-nombre": { type: "text" },
};

const COLOR_RE = /^(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)%\s+(\d{1,3}(?:\.\d+)?)%$/;
const LENGTH_RE = /^(\d{1,3}(?:\.\d+)?)(px|rem|em)$/;
const NUMBER_RE = /^\d+(?:\.\d+)?$/;
// URL https, sin caracteres que permitan escapar del valor CSS.
const URL_RE = /^https:\/\/[A-Za-z0-9\-._~:/?#[\]@!$&'*+,;=%]+$/;
const FONT_WEIGHTS = new Set([300, 400, 500, 600, 700, 800]);

/** Convierte una longitud a su magnitud en px aproximada, para acotar rangos. */
function lengthMagnitude(value: number, unit: string): number {
  if (unit === "rem" || unit === "em") return value * 16;
  return value;
}

/**
 * Valida un par (clave, valor) contra la lista blanca.
 * Devuelve el valor normalizado listo para CSS, o null si no es válido.
 */
export function validateToken(key: string, raw: unknown): string | null {
  const spec = TOKEN_SPECS[key];
  if (!spec) return null;
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const value = String(raw).trim();
  if (value.length === 0 || value.length > 300) return null;

  switch (spec.type) {
    case "color": {
      const m = COLOR_RE.exec(value);
      if (!m) return null;
      const [h, s, l] = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (h > 360 || s > 100 || l > 100) return null;
      return value;
    }
    case "length": {
      const m = LENGTH_RE.exec(value);
      if (!m) return null;
      const mag = lengthMagnitude(Number(m[1]), m[2]);
      if (spec.min !== undefined && mag < spec.min) return null;
      if (spec.max !== undefined && mag > spec.max) return null;
      return value;
    }
    case "number": {
      if (!NUMBER_RE.test(value)) return null;
      const n = Number(value);
      if (spec.min !== undefined && n < spec.min) return null;
      if (spec.max !== undefined && n > spec.max) return null;
      return value;
    }
    case "fontFamily": {
      // Solo nombres de la lista curada; se resuelven a su variable next/font.
      return familiaDeFuente(value);
    }
    case "fontWeight": {
      if (!NUMBER_RE.test(value)) return null;
      return FONT_WEIGHTS.has(Number(value)) ? value : null;
    }
    case "url": {
      if (!URL_RE.test(value)) return null;
      return `url("${value}")`;
    }
    case "text": {
      // Solo texto plano corto y seguro para un valor CSS entre comillas.
      const clean = value.replace(/[^\p{L}\p{N} .,&'’\-]/gu, "").slice(0, 60);
      if (clean.length === 0) return null;
      return `"${clean}"`;
    }
    default:
      return null;
  }
}
