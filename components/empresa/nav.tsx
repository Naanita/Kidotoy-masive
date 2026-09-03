"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ENLACES = [
  { href: "/empresa/panel", label: "Avance" },
  { href: "/empresa/selecciones", label: "Selecciones" },
];

export function NavEmpresa() {
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
