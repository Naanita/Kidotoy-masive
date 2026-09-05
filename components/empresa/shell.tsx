import { Eye } from "lucide-react";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { MarcaAcueducto, MarcaKidotoy } from "@/components/marca/logotipo";
import { Badge } from "@/components/ui/badge";
import { NavEmpresa } from "./nav";
import { salirEmpresa } from "@/app/empresa/actions";

/**
 * Marco del portal del Acueducto. La marca dominante es la del ACUEDUCTO (es lo
 * que ve un jefe de RR. HH. de una entidad pública); Kidotoy se reduce a una
 * firma discreta al pie. Registro intermedio: más aire que el panel de Kidotoy,
 * menos que el espacio del colaborador.
 *
 * SOLO LECTURA: no lleva ningún control de acción (editar, liberar, inventario).
 * Si no puede hacerse desde aquí, no aparece —ni siquiera deshabilitado—.
 */
export function ShellEmpresa({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <MarcaAcueducto />
          <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />
          <Badge variant="secondary" className="shrink-0">
            <Eye className="mr-1 size-3.5" aria-hidden />
            Solo consulta
          </Badge>
        </div>
        <BotonCerrarSesion accion={salirEmpresa} />
      </header>

      <NavEmpresa />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>

      {/* Firma discreta de Kidotoy: el programa lo opera Kidotoy, pero aquí no
          es la marca dominante. */}
      <footer className="border-t px-4 py-4 sm:px-6">
        <p className="mx-auto flex max-w-5xl items-center gap-1.5 text-xs text-muted-foreground">
          Programa de bienestar operado por
          <MarcaKidotoy alturaClase="h-4" />
        </p>
      </footer>
    </div>
  );
}
