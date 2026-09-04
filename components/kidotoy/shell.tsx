import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { MarcaKidotoy } from "@/components/marca/logotipo";
import { NavKidotoy } from "./nav";
import { salirKidotoy } from "@/app/kidotoy/actions";

/** Marco del panel de Kidotoy: logo de Kidotoy + salir + navegación. */
export function ShellKidotoy({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <MarcaKidotoy />
          <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />
          <span className="text-sm text-muted-foreground">Administración</span>
        </div>
        <BotonCerrarSesion accion={salirKidotoy} />
      </header>
      <NavKidotoy />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
