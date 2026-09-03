import { Eye } from "lucide-react";
import { obtenerConfigPublica } from "@/lib/theme/config";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { Badge } from "@/components/ui/badge";
import { NavEmpresa } from "./nav";
import { salirEmpresa } from "@/app/empresa/actions";

/**
 * Marco del portal del Acueducto. Es un espacio SOLO LECTURA: no lleva ningún
 * control de acción (ni editar, ni liberar, ni inventario). Si no puede
 * hacerse desde aquí, no aparece.
 */
export async function ShellEmpresa({ children }: { children: React.ReactNode }) {
  const config = await obtenerConfigPublica();
  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-semibold">
            {config.marca_nombre}
          </span>
          <Badge variant="secondary">
            <Eye className="mr-1 size-3.5" aria-hidden />
            Solo consulta
          </Badge>
        </div>
        <BotonCerrarSesion accion={salirEmpresa} />
      </header>
      <NavEmpresa />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
