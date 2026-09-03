import type { Config } from "tailwindcss";

/**
 * Todo el estilo se lee desde variables CSS (convención shadcn). El panel
 * /dev/tema cambia esas variables en vivo, así que aquí NO puede quedar ningún
 * valor fijo de color, radio, espaciado, sombra o escala tipográfica: todo se
 * deriva de tokens. A valores por defecto, cada fórmula reproduce el valor de
 * Tailwind, así que el aspecto no cambia hasta que se mueve un control.
 */

// Escala de espaciado derivada de --spacing-unit y multiplicada por --density.
// n * 0.25rem * 1 (defaults) == escala por defecto de Tailwind.
const SPACING_STEPS = [
  0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28,
  32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
];
const spacing: Record<string, string> = { px: "1px", "0": "0px" };
for (const n of SPACING_STEPS) {
  spacing[String(n)] = `calc(var(--spacing-unit) * ${n} * var(--density))`;
}

// Escala tipográfica geométrica a partir de --font-scale (razón entre pasos).
// 1rem es relativo a la raíz, que vale --font-size-base.
const r = "var(--font-scale)";
const pow = (n: number) => {
  if (n === 0) return "1rem";
  const factors = Array(Math.abs(n)).fill(r);
  return n > 0
    ? `calc(1rem * ${factors.join(" * ")})`
    : `calc(1rem / ${factors.join(" / ")})`;
};
const fontSize: Record<string, [string, { lineHeight: string }]> = {
  xs: [pow(-2), { lineHeight: "1.4" }],
  sm: [pow(-1), { lineHeight: "1.45" }],
  base: [pow(0), { lineHeight: "1.5" }],
  lg: [pow(1), { lineHeight: "1.5" }],
  xl: [pow(2), { lineHeight: "1.4" }],
  "2xl": [pow(3), { lineHeight: "1.3" }],
  "3xl": [pow(4), { lineHeight: "1.2" }],
  "4xl": [pow(5), { lineHeight: "1.15" }],
  "5xl": [pow(6), { lineHeight: "1.1" }],
  "6xl": [pow(7), { lineHeight: "1.05" }],
  "7xl": [pow(8), { lineHeight: "1.05" }],
  "8xl": [pow(9), { lineHeight: "1" }],
  "9xl": [pow(10), { lineHeight: "1" }],
};

// Sombras suaves y difusas, con opacidad derivada de --shadow-level (0 = ninguna).
// Tono azulado (colores de marca) y radios de desenfoque amplios para el look
// de los mockups.
const sh = (a: number) => `hsl(214 40% 30% / calc(var(--shadow-level) * ${a}))`;
const boxShadow = {
  sm: `0 1px 3px 0 ${sh(0.7)}`,
  DEFAULT: `0 2px 8px -1px ${sh(1)}, 0 1px 3px -1px ${sh(0.7)}`,
  md: `0 6px 16px -2px ${sh(1)}, 0 2px 6px -2px ${sh(0.7)}`,
  lg: `0 12px 28px -4px ${sh(1)}, 0 4px 10px -4px ${sh(0.7)}`,
  xl: `0 24px 48px -8px ${sh(1.1)}, 0 8px 18px -6px ${sh(0.7)}`,
  none: "none",
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      spacing,
      fontSize,
      boxShadow,
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        sans: ["var(--font-body)"],
      },
      fontWeight: {
        heading: "var(--font-weight-heading)" as unknown as string,
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
