import { ShellKidotoy } from "@/components/kidotoy/shell";
import { BuscadorLiberar } from "@/components/kidotoy/buscador-liberar";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerFilasSelecciones } from "@/lib/kidotoy/datos";

export default async function PaginaLiberar() {
  const { empresaId, email } = await obtenerContexto();
  const filas = empresaId ? await obtenerFilasSelecciones(empresaId) : [];
  const confirmadas = filas.filter(
    (f) => f.estado === "confirmado" && f.seleccionId,
  );

  return (
    <ShellKidotoy>
      <h1 className="mb-1 text-xl font-semibold">Liberar selección</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Busca la selección confirmada, revisa los datos y libérala con un motivo.
        Es irreversible para el colaborador y queda en auditoría.
      </p>
      <BuscadorLiberar confirmadas={confirmadas} adminEmail={email ?? "—"} />
    </ShellKidotoy>
  );
}
