import {
  CheckCircle2,
  TriangleAlert,
  Ban,
  Clock,
  PackageCheck,
  Package,
  Tent,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Chip de estado (DESIGN §4): píldora con fondo del color al ~12%, texto y anillo
 * en el color pleno, e ícono a la izquierda. El estado NUNCA se comunica solo con
 * color: siempre lleva ícono y texto. Colores por tokens.
 */
export type TipoEstado =
  | "disponible"
  | "ultimas"
  | "agotado"
  | "confirmado"
  | "pendiente"
  | "entregado"
  | "fuera_de_carpa";

const ESTADOS = {
  disponible: { icon: Package, clase: "bg-success/15 text-success ring-success/40", label: "Disponible" },
  ultimas: { icon: TriangleAlert, clase: "bg-warning/15 text-warning ring-warning/40", label: "Últimas unidades" },
  agotado: { icon: Ban, clase: "bg-destructive/15 text-destructive ring-destructive/40", label: "Agotado" },
  confirmado: { icon: CheckCircle2, clase: "bg-success/15 text-success ring-success/40", label: "Confirmado" },
  pendiente: { icon: Clock, clase: "bg-accent text-primary ring-primary/25", label: "Pendiente" },
  entregado: { icon: PackageCheck, clase: "bg-success/15 text-success ring-success/40", label: "Entregado" },
  fuera_de_carpa: { icon: Tent, clase: "bg-kido-morado/15 text-kido-morado ring-kido-morado/40", label: "Fuera de carpa" },
} as const;

export function ChipEstado({
  tipo,
  children,
  className,
}: {
  tipo: TipoEstado;
  children?: React.ReactNode;
  className?: string;
}) {
  const e = ESTADOS[tipo];
  const Icon = e.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        e.clase,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {children ?? e.label}
    </span>
  );
}
