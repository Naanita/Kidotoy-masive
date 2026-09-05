import { ShellKidotoy } from "@/components/kidotoy/shell";
import { GestionOperarios } from "@/components/kidotoy/gestion-operarios";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerCarpas, obtenerOperarios } from "@/lib/kidotoy/carpas";

export const dynamic = "force-dynamic";

export default async function PaginaOperarios() {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) {
    return (
      <ShellKidotoy>
        <p className="text-sm text-muted-foreground">Sesión sin empresa.</p>
      </ShellKidotoy>
    );
  }
  const [operarios, carpas] = await Promise.all([
    obtenerOperarios(empresaId),
    obtenerCarpas(empresaId),
  ]);

  return (
    <ShellKidotoy>
      <h1 className="mb-1 font-heading text-xl font-semibold text-foreground">Operarios de entrega</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Cuentas del personal de la jornada, cada una con su carpa.
      </p>
      <GestionOperarios operarios={operarios} carpas={carpas} />
    </ShellKidotoy>
  );
}
