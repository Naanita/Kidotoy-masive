"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { MarcaKidotoy } from "@/components/marca/logotipo";
import { NavKidotoy } from "./nav";
import { salirKidotoy } from "@/app/kidotoy/actions";

/** Contenido de la barra lateral azul profundo: logo, navegación, salir. */
function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-primary-deep text-white">
      <div className="flex h-16 shrink-0 items-center px-4">
        <span className="rounded-md bg-white px-2.5 py-1.5">
          <MarcaKidotoy alturaClase="h-6" />
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <NavKidotoy onNavigate={onNavigate} />
      </div>
      <div className="shrink-0 border-t border-white/10 p-3">
        <p className="mb-1.5 px-1 text-xs font-medium uppercase tracking-wide text-white/50">
          Administración
        </p>
        <BotonCerrarSesion
          accion={salirKidotoy}
          siempreTexto
          className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
        />
      </div>
    </div>
  );
}

/**
 * Marco del panel de Kidotoy: barra lateral fija en escritorio, cajón deslizable
 * en móvil. Denso y profesional, escritorio primero.
 */
export function ShellKidotoy({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="min-h-dvh bg-secondary/40 lg:grid lg:grid-cols-[240px_1fr]">
      {/* Barra lateral fija (escritorio) */}
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <Sidebar />
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Barra superior con menú (móvil) */}
        <header className="flex items-center gap-3 bg-primary-deep px-4 py-2.5 text-white lg:hidden">
          <button
            type="button"
            onClick={() => setAbierto(true)}
            aria-label="Abrir menú"
            className="-ml-1 rounded-md p-1 hover:bg-white/10"
          >
            <Menu className="size-6" aria-hidden />
          </button>
          <span className="rounded bg-white px-2 py-1">
            <MarcaKidotoy alturaClase="h-5" />
          </span>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6">{children}</main>
      </div>

      {/* Cajón deslizable (móvil) */}
      {abierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setAbierto(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <Sidebar onNavigate={() => setAbierto(false)} />
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar menú"
              className="absolute right-2 top-4 rounded-md p-1 text-white/80 hover:bg-white/10"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
