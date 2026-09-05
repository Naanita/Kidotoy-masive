import {
  CheckCircle2,
  TriangleAlert,
  Ban,
  Clock,
  PackageCheck,
  Package,
  Tent,
  type LucideIcon,
} from "lucide-react";

/**
 * Fuente única de la semántica de estado del producto/beneficiario.
 *
 * El COLOR aquí codifica SIEMPRE estado (disponible / últimas / agotado / …),
 * nunca edad ni ninguna otra dimensión: un solo lenguaje de color por tarjeta.
 * La edad y demás se comunican con texto. El estado además lleva ícono + texto,
 * nunca solo color.
 *
 * Las clases son literales (no interpoladas) para que el JIT de Tailwind las
 * genere. Todo sale de tokens del tema salvo `kido-morado`, color de marca fijo.
 */
export type TipoEstado =
  | "disponible"
  | "ultimas"
  | "agotado"
  | "confirmado"
  | "pendiente"
  | "entregado"
  | "fuera_de_carpa";

export type VisualEstado = {
  icon: LucideIcon;
  label: string;
  /** Texto/ícono en el color pleno. */
  texto: string;
  /** Fondo tenue de la píldora tintada. */
  chipBg: string;
  /** Relleno pleno de la barra/cápsula (el gesto repetido). */
  barra: string;
};

export const ESTADO_VISUAL: Record<TipoEstado, VisualEstado> = {
  disponible: {
    icon: Package,
    label: "Disponible",
    texto: "text-success",
    chipBg: "bg-success/12",
    barra: "bg-success",
  },
  ultimas: {
    icon: TriangleAlert,
    label: "Últimas unidades",
    texto: "text-warning",
    chipBg: "bg-warning/15",
    barra: "bg-warning",
  },
  agotado: {
    icon: Ban,
    label: "Agotado",
    texto: "text-destructive",
    chipBg: "bg-destructive/12",
    barra: "bg-destructive",
  },
  confirmado: {
    icon: CheckCircle2,
    label: "Confirmado",
    texto: "text-success",
    chipBg: "bg-success/12",
    barra: "bg-success",
  },
  pendiente: {
    icon: Clock,
    label: "Pendiente",
    texto: "text-primary",
    chipBg: "bg-accent",
    barra: "bg-primary",
  },
  entregado: {
    icon: PackageCheck,
    label: "Entregado",
    texto: "text-success",
    chipBg: "bg-success/12",
    barra: "bg-success",
  },
  fuera_de_carpa: {
    icon: Tent,
    label: "Fuera de carpa",
    texto: "text-kido-morado",
    chipBg: "bg-kido-morado/15",
    barra: "bg-kido-morado",
  },
};
