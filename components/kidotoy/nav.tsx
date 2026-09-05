"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Package,
  Truck,
  Tent,
  Users,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ENLACES: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/kidotoy/panel", label: "Resumen", icon: LayoutDashboard },
  { href: "/kidotoy/selecciones", label: "Selecciones", icon: ListChecks },
  { href: "/kidotoy/inventario", label: "Inventario", icon: Package },
  { href: "/kidotoy/entregas", label: "Entregas", icon: Truck },
  { href: "/kidotoy/carpas", label: "Carpas", icon: Tent },
  { href: "/kidotoy/operarios", label: "Operarios", icon: Users },
  { href: "/kidotoy/catalogo", label: "Catálogo", icon: BookOpen },
];

/** Navegación vertical de la barra lateral (azul profundo). */
export function NavKidotoy({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {ENLACES.map((e) => {
        const activo = pathname === e.href || pathname.startsWith(e.href + "/");
        const Icon = e.icon;
        return (
          <Link
            key={e.href}
            href={e.href}
            onClick={onNavigate}
            aria-current={activo ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activo
                ? "bg-white/15 text-white before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:rounded-full before:bg-kido-amarillo"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {e.label}
          </Link>
        );
      })}
    </nav>
  );
}
