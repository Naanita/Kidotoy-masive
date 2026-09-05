import { ShellKidotoy } from "@/components/kidotoy/shell";
import { RejillaCobertura } from "@/components/kidotoy/rejilla-cobertura";
import { TablaInventario } from "@/components/kidotoy/tabla-inventario";
import { obtenerContexto } from "@/lib/auth/session";
import {
  obtenerCoberturaGrupos,
  obtenerProductosAdmin,
} from "@/lib/kidotoy/datos";

export default async function PaginaInventario() {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) {
    return (
      <ShellKidotoy>
        <p className="text-sm text-muted-foreground">Sesión sin empresa.</p>
      </ShellKidotoy>
    );
  }

  const [cobertura, productos] = await Promise.all([
    obtenerCoberturaGrupos(empresaId),
    obtenerProductosAdmin(empresaId),
  ]);

  return (
    <ShellKidotoy>
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Inventario
      </h1>

      <div className="space-y-6">
        <RejillaCobertura cobertura={cobertura} />

        <section>
          <div className="mb-3">
            <h2 className="font-heading text-base font-semibold text-foreground">
              Referencias
            </h2>
            <p className="text-xs text-muted-foreground">
              Edita el total de unidades de cada referencia. El mínimo es lo ya
              consumido.
            </p>
          </div>
          <TablaInventario productos={productos} />
        </section>
      </div>
    </ShellKidotoy>
  );
}
