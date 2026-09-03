import { ShellKidotoy } from "@/components/kidotoy/shell";
import { GestionCatalogo } from "@/components/kidotoy/gestion-catalogo";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerProductosAdmin } from "@/lib/kidotoy/datos";

export default async function PaginaCatalogo() {
  const { empresaId } = await obtenerContexto();
  const productos = empresaId ? await obtenerProductosAdmin(empresaId) : [];

  return (
    <ShellKidotoy>
      <h1 className="mb-1 text-xl font-semibold">Catálogo</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Alta y edición de referencias. Recuerda que el catálogo se filtra por
        edad exacta y género.
      </p>
      <GestionCatalogo productos={productos} />
    </ShellKidotoy>
  );
}
