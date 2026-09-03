"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/kidotoy/panel", label: "Resumen" },
  { href: "/kidotoy/selecciones", label: "Selecciones" },
  { href: "/kidotoy/inventario", label: "Inventario" },
  { href: "/kidotoy/entregas", label: "Entregas" },
  { href: "/kidotoy/carpas", label: "Carpas" },
  { href: "/kidotoy/operarios", label: "Operarios" },
  { href: "/kidotoy/liberar", label: "Liberar" },
  { href: "/kidotoy/catalogo", label: "Catálogo" },
];

export function NavKidotoy() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b px-2">
      {ENLACES.map((e) => {
        const activo = pathname === e.href;
        return (
          <Link
            key={e.href}
            href={e.href}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              activo
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {e.label}
          </Link>
        );
      })}
    </nav>
  );
}
