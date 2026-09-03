import { EncabezadoEspacio } from "@/components/espacio/encabezado";
import { PanelTema } from "@/components/dev/panel-tema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Overrides } from "@/lib/theme/defaults";
import { salirDev } from "../actions";

export const dynamic = "force-dynamic";

export default async function PaginaTema() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("tema").select("tokens").maybeSingle();
  const temaGuardado = ((data?.tokens as Overrides) ?? {}) satisfies Overrides;

  return (
    <div className="min-h-dvh">
      <EncabezadoEspacio titulo="Panel de temas" accionCerrar={salirDev} />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">Tema de la empresa</h1>
          <p className="text-sm text-muted-foreground">
            Ajusta colores, tipografía, forma y marca. La vista previa cambia en
            vivo; nada se guarda hasta que le das a <strong>Guardar</strong>.
          </p>
        </div>
        <PanelTema temaGuardado={temaGuardado} />
      </main>
    </div>
  );
}
