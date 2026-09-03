import { ShellKidotoy } from "@/components/kidotoy/shell";
import { GestionCarpas } from "@/components/kidotoy/gestion-carpas";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerCarpas, obtenerReferenciasConCarpa } from "@/lib/kidotoy/carpas";

export const dynamic = "force-dynamic";

export default async function PaginaCarpas() {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) {
    return (
      <ShellKidotoy>
        <p className="text-sm text-muted-foreground">Sesión sin empresa.</p>
      </ShellKidotoy>
    );
  }
  const [carpas, referencias] = await Promise.all([
    obtenerCarpas(empresaId),
    obtenerReferenciasConCarpa(empresaId),
  ]);

  return (
    <ShellKidotoy>
      <h1 className="mb-1 text-xl font-semibold">Carpas y referencias</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Define los puntos de entrega y qué juguete se despacha en cada uno.
      </p>
      <GestionCarpas carpas={carpas} referencias={referencias} />
    </ShellKidotoy>
  );
}
