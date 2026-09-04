import {
  CheckCircle2,
  TriangleAlert,
  Ban,
  Clock,
  PackageCheck,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Chip de estado, suave (fondo tintado + ícono + texto), como en los mockups.
 * El estado NUNCA se comunica solo con color: siempre lleva ícono y texto.
 * Colores por tokens (modificadores de opacidad sobre los colores de estado).
 */
export type TipoEstado =
  | "disponible"
  | "ultimas"
  | "agotado"
  | "confirmado"
  | "pendiente"
  | "entregado";

const ESTADOS = {
  disponible: { icon: Package, clase: "bg-success/10 text-success ring-success/25", label: "Disponible" },
  ultimas: { icon: TriangleAlert, clase: "bg-warning/15 text-warning ring-warning/30", label: "Últimas unidades" },
  agotado: { icon: Ban, clase: "bg-destructive/10 text-destructive ring-destructive/25", label: "Agotado" },
  confirmado: { icon: CheckCircle2, clase: "bg-success/10 text-success ring-success/25", label: "Confirmado" },
  pendiente: { icon: Clock, clase: "bg-secondary text-secondary-foreground ring-primary/15", label: "Pendiente" },
  entregado: { icon: PackageCheck, clase: "bg-success/10 text-success ring-success/25", label: "Entregado" },
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
