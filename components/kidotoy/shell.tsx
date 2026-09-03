import { obtenerConfigPublica } from "@/lib/theme/config";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { NavKidotoy } from "./nav";
import { salirKidotoy } from "@/app/kidotoy/actions";

/** Marco del panel de Kidotoy: marca + salir + navegación entre secciones. */
export async function ShellKidotoy({ children }: { children: React.ReactNode }) {
  const config = await obtenerConfigPublica();
  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-lg font-semibold">
            {config.marca_nombre}
          </span>
          <span className="text-sm text-muted-foreground">Administración</span>
        </div>
        <BotonCerrarSesion accion={salirKidotoy} />
      </header>
      <NavKidotoy />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
