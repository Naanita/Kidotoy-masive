import { type NextRequest } from "next/server";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerFilasEntregaGestion } from "@/lib/kidotoy/entregas";
import { filtrarEntregas } from "@/lib/kidotoy/filtros";
import { construirCsv, respuestaCsv, fechaCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

/**
 * GET /kidotoy/entregas/export — consolidado de la jornada de entrega.
 * Mismo formato Excel-es (punto y coma, BOM, DD/MM/AAAA). Protegido por sesión.
 */
export async function GET(request: NextRequest) {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) return new Response("Sin sesión", { status: 401 });

  const sp = request.nextUrl.searchParams;
  const filas = filtrarEntregas(await obtenerFilasEntregaGestion(empresaId), {
    carpaId: sp.get("carpa"),
    estado: sp.get("estado"),
    q: sp.get("q"),
  });

  const encabezados = [
    "Beneficiario",
    "Carpa",
    "Colaborador",
    "Cedula",
    "Juguete",
    "Codigo de entrega",
    "Estado",
    "Operario",
    "Fuera de carpa",
    "Fecha de entrega",
  ];
  const cuerpo = filas.map((f) => [
    f.beneficiario,
    f.carpaNombre ?? "Sin carpa",
    f.colaborador,
    f.cedula,
    f.producto,
    f.codigo,
    f.entregado ? "Entregado" : "Pendiente",
    f.operario ?? "",
    f.fueraDeCarpa ? "Si" : "",
    fechaCsv(f.entregadoEn),
  ]);

  return respuestaCsv("entregas-consolidado.csv", construirCsv(encabezados, cuerpo));
}
