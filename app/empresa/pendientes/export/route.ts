import { obtenerContexto } from "@/lib/auth/session";
import { obtenerColaboradoresPendientes } from "@/lib/kidotoy/datos";
import { construirCsv, respuestaCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

/**
 * GET /empresa/pendientes/export — CSV de colaboradores que aún no completan la
 * selección de sus hijos. Solo lectura del Acueducto: sin código de entrega
 * (token de reclamo) y sin ningún dato de negocio (costos, precios).
 */
export async function GET() {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) return new Response("Sin sesión", { status: 401 });

  const pendientes = await obtenerColaboradoresPendientes(empresaId);
  const encabezados = ["Colaborador", "Cedula", "Area", "Le faltan", "Total hijos"];
  const cuerpo = pendientes.map((c) => [
    c.nombre,
    c.cedula,
    c.area ?? "",
    c.pendientes,
    c.total,
  ]);

  return respuestaCsv(
    "colaboradores-pendientes.csv",
    construirCsv(encabezados, cuerpo),
  );
}
