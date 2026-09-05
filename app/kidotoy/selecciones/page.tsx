import { ShellKidotoy } from "@/components/kidotoy/shell";
import { TablaSelecciones } from "@/components/kidotoy/tabla-selecciones";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerFilasSelecciones } from "@/lib/kidotoy/datos";

export default async function PaginaSelecciones() {
  const { empresaId, email } = await obtenerContexto();
  const filas = empresaId ? await obtenerFilasSelecciones(empresaId) : [];
  const areas = [
    ...new Set(filas.map((f) => f.area).filter(Boolean) as string[]),
  ].sort();

  return (
    <ShellKidotoy>
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Selecciones
      </h1>
      <TablaSelecciones
        filas={filas}
        areas={areas}
        adminEmail={email ?? "—"}
        permitirLiberar
      />
    </ShellKidotoy>
  );
}
