import { familiaDeFuente } from "./fonts";

/** Valores por defecto del tema (modo claro), espejo de globals.css :root. */
export const DEFAULTS_LIGHT: Record<string, string> = {
  background: "214 33% 97%",
  foreground: "215 28% 17%",
  card: "0 0% 100%",
  "card-foreground": "215 28% 17%",
  popover: "0 0% 100%",
  "popover-foreground": "215 28% 17%",
  primary: "211 100% 50%",
  "primary-foreground": "0 0% 100%",
  secondary: "205 100% 95%",
  "secondary-foreground": "214 82% 42%",
  muted: "214 30% 95%",
  "muted-foreground": "216 10% 46%",
  accent: "205 100% 95%",
  "accent-foreground": "214 82% 42%",
  destructive: "359 100% 65%",
  "destructive-foreground": "0 0% 100%",
  success: "142 71% 45%",
  "success-foreground": "0 0% 100%",
  warning: "38 92% 50%",
  "warning-foreground": "215 28% 17%",
  border: "220 13% 91%",
  input: "220 13% 91%",
  ring: "211 100% 50%",
  "font-heading": "Montserrat",
  "font-body": "Inter",
  "font-size-base": "16px",
  "font-scale": "1.2",
  "font-weight-heading": "600",
  radius: "0.75rem",
  "spacing-unit": "0.25rem",
  density: "1",
  "shadow-level": "0.08",
  "logo-url": "",
  "logo-dark-url": "",
  "favicon-url": "",
  "marca-nombre": "Kidotoy",
};

/** Overrides de color del modo oscuro (globals.css .dark). */
export const DEFAULTS_DARK: Record<string, string> = {
  ...DEFAULTS_LIGHT,
  background: "215 32% 12%",
  foreground: "0 0% 98%",
  card: "215 30% 15%",
  "card-foreground": "0 0% 98%",
  popover: "215 30% 15%",
  "popover-foreground": "0 0% 98%",
  primary: "211 100% 60%",
  "primary-foreground": "0 0% 100%",
  secondary: "214 40% 22%",
  "secondary-foreground": "205 100% 90%",
  muted: "215 25% 20%",
  "muted-foreground": "216 15% 68%",
  accent: "214 40% 22%",
  "accent-foreground": "205 100% 90%",
  destructive: "359 90% 62%",
  "destructive-foreground": "0 0% 100%",
  "success-foreground": "0 0% 100%",
  border: "215 20% 26%",
  input: "215 20% 26%",
  ring: "211 100% 60%",
};

/** Claves de token que son color (canales HSL). */
export const COLOR_KEYS = Object.keys(DEFAULTS_LIGHT).filter(
  (k) =>
    /^(\d)/.test(DEFAULTS_LIGHT[k]) && DEFAULTS_LIGHT[k].includes("%"),
);

export type Overrides = Record<string, string>;

/**
 * Estilo inline (variables CSS) para la vista previa, combinando los valores
 * por defecto del modo con los cambios del usuario. Las fuentes se resuelven a
 * su variable next/font; los colores quedan como "H S% L%".
 */
export function estiloPreview(
  overrides: Overrides,
  modo: "light" | "dark",
): React.CSSProperties {
  const base = modo === "dark" ? DEFAULTS_DARK : DEFAULTS_LIGHT;
  const efectivo = { ...base, ...overrides };
  const style: Record<string, string> = {};
  for (const [k, v] of Object.entries(efectivo)) {
    if (v === "") continue;
    if (k === "font-heading" || k === "font-body") {
      style[`--${k}`] = familiaDeFuente(v) ?? v;
    } else {
      style[`--${k}`] = v;
    }
  }
  return style as React.CSSProperties;
}
