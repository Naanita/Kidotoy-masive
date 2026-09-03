import { ModuloEntrega } from "@/components/entrega/modulo-entrega";
import { obtenerContexto } from "@/lib/auth/session";
import { contarEntregas, obtenerCarpaOperario } from "@/lib/entrega/datos";
import { salirEntrega } from "../actions";

export const dynamic = "force-dynamic";

export default async function PaginaPanelEntrega() {
  const { empresaId } = await obtenerContexto();
  const [total, carpa] = await Promise.all([
    empresaId ? contarEntregas(empresaId) : Promise.resolve(0),
    obtenerCarpaOperario(),
  ]);
  return (
    <ModuloEntrega
      totalInicial={total}
      accionCerrar={salirEntrega}
      carpaOperarioId={carpa.carpaId}
      carpaOperarioNombre={carpa.carpaNombre}
    />
  );
}
