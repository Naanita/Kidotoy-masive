import { type NextRequest } from "next/server";
import { obtenerContexto } from "@/lib/auth/session";
import { obtenerFilasSelecciones } from "@/lib/kidotoy/datos";
import { filtrarSelecciones } from "@/lib/kidotoy/filtros";
import { construirCsv, respuestaCsv, fechaCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

/**
 * GET /empresa/selecciones/export — CSV para el Acueducto (solo lectura).
 * Mismo formato Excel-es que el de Kidotoy (punto y coma, BOM, DD/MM/AAAA).
 * Sin ninguna columna de negocio (costos, precios): no existen en el modelo.
 * Protegido por la sesión (middleware exige rol empresa_cliente en /empresa).
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
    f.estado === "confirmado" ? "Confirmado" : "Pendiente",
    fechaCsv(f.confirmadaEn),
  ]);

  return respuestaCsv("avance-acueducto.csv", construirCsv(encabezados, cuerpo));
}
