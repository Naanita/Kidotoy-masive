import { type NextRequest } from "next/server";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerFilasSelecciones } from "@/lib/kidotoy/datos";
import { filtrarSelecciones } from "@/lib/kidotoy/filtros";
import { construirCsv, respuestaCsv, fechaCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

/**
 * GET /kidotoy/selecciones/export — CSV de las selecciones filtradas.
 * Protegido por la sesión (el middleware exige rol admin_kidotoy en /kidotoy).
 * CSV para Excel-es: punto y coma, UTF-8 con BOM, fechas DD/MM/AAAA.
 */
export async function GET(request: NextRequest) {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) return new Response("Sin sesión", { status: 401 });

  const sp = request.nextUrl.searchParams;
  const filas = filtrarSelecciones(await obtenerFilasSelecciones(empresaId), {
    edad: sp.get("edad"),
    genero: sp.get("genero"),
    area: sp.get("area"),
    estado: sp.get("estado"),
    q: sp.get("q"),
  });

  const encabezados = [
    "Beneficiario",
    "Edad",
    "Genero",
    "Colaborador",
    "Cedula",
    "Area",
    "Juguete",
    "Codigo de entrega",
    "Estado",
    "Fecha de confirmacion",
  ];
  const cuerpo = filas.map((f) => [
    f.beneficiario,
    f.edad,
    f.genero,
    f.colaborador,
    f.cedula,
    f.area ?? "",
    f.producto ?? "",
    f.codigoEntrega ?? "",
    f.estado === "confirmado" ? "Confirmado" : "Pendiente",
    fechaCsv(f.confirmadaEn),
  ]);

  return respuestaCsv("selecciones.csv", construirCsv(encabezados, cuerpo));
}
