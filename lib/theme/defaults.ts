import { familiaDeFuente } from "./fonts";

/** Valores por defecto del tema (modo claro), espejo de globals.css :root. */
export const DEFAULTS_LIGHT: Record<string, string> = {
  background: "0 0% 100%",
  foreground: "0 0% 20%",
  card: "0 0% 100%",
  "card-foreground": "0 0% 20%",
  popover: "0 0% 100%",
  "popover-foreground": "0 0% 20%",
  primary: "211 100% 50%",
  "primary-foreground": "0 0% 100%",
  secondary: "214 33% 97%",
  "secondary-foreground": "0 0% 20%",
  muted: "214 33% 97%",
  "muted-foreground": "0 0% 40%",
  accent: "205 100% 95%",
  "accent-foreground": "214 82% 42%",
  destructive: "0 78% 58%",
  "destructive-foreground": "0 0% 100%",
  success: "142 71% 45%",
  "success-foreground": "0 0% 100%",
  warning: "40 94% 52%",
  "warning-foreground": "0 0% 20%",
  border: "0 0% 93%",
  input: "0 0% 93%",
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
  background: "214 40% 10%",
  foreground: "0 0% 96%",
  card: "214 38% 14%",
  "card-foreground": "0 0% 96%",
  popover: "214 38% 14%",
  "popover-foreground": "0 0% 96%",
  primary: "211 100% 60%",
  "primary-foreground": "0 0% 100%",
  secondary: "214 30% 20%",
  "secondary-foreground": "0 0% 96%",
  muted: "214 28% 18%",
  "muted-foreground": "0 0% 68%",
  accent: "214 40% 24%",
  "accent-foreground": "205 100% 90%",
  destructive: "0 78% 62%",
  "destructive-foreground": "0 0% 100%",
  "success-foreground": "0 0% 100%",
  "warning-foreground": "0 0% 12%",
  border: "214 24% 24%",
  input: "214 24% 24%",
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
