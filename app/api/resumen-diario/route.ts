import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { enviarCorreo } from "@/lib/email/resend";
import { plantillaResumenDiario } from "@/lib/email/plantillas";

export const dynamic = "force-dynamic";

const TZ = "America/Bogota";
const UMBRAL = 0.2;

/** Fecha larga de hoy e inicio del día (Bogotá) en ISO, para "confirmados hoy". */
function hoyBogota() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TZ,
  }).format(new Date());
  const larga = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(new Date());
  return { inicioIso: `${partes}T00:00:00-05:00`, larga };
}

/**
 * GET/POST /api/resumen-diario — envía el resumen diario a Kidotoy.
 * Protegida por CRON_SECRET (header x-cron-secret o ?secret=). Usa la service
 * role key SOLO tras validar el secreto (ruta autenticada, nunca pública).
 * Conéctale un cron externo una vez al día.
 */
async function handler(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const enviado =
    request.headers.get("x-cron-secret") ??
    request.nextUrl.searchParams.get("secret");
  if (!secret || enviado !== secret) {
    return NextResponse.json({ ok: false, error: "no autorizado" }, { status: 401 });
  }

  const destino = process.env.RESUMEN_EMAIL;
  if (!destino) {
    return NextResponse.json({ ok: false, error: "RESUMEN_EMAIL no configurado" }, { status: 500 });
  }

  const slug = process.env.NEXT_PUBLIC_EMPRESA_SLUG ?? "acueducto";
  const supabase = createSupabaseAdminClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nombre")
    .eq("slug", slug)
    .maybeSingle();
  if (!empresa) {
    return NextResponse.json({ ok: false, error: "empresa no encontrada" }, { status: 404 });
  }
  const empresaId = (empresa as { id: string }).id;
  const { inicioIso, larga } = hoyBogota();

  const [
    { count: total },
    { count: confirmados },
    { count: confirmadosHoy },
    { data: productos },
    { data: colaboradores },
  ] = await Promise.all([
    supabase.from("beneficiarios").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId),
    supabase.from("selecciones").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId),
    supabase.from("selecciones").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId).gte("confirmada_en", inicioIso),
    supabase.from("productos").select("stock_inicial, stock_disponible, activo").eq("empresa_id", empresaId),
    supabase.from("colaboradores").select("nombre, area, beneficiarios(id, selecciones(id))").eq("empresa_id", empresaId),
  ]);

  const activos = (productos ?? []).filter((p) => p.activo);
  const agotadas = activos.filter((p) => p.stock_disponible === 0).length;
  const porAgotarse = activos.filter(
    (p) => p.stock_disponible > 0 && p.stock_disponible < p.stock_inicial * UMBRAL,
  ).length;

  const pendientes = ((colaboradores as unknown[]) ?? [])
    .map((row) => {
      const c = row as {
        nombre: string;
        area: string | null;
        beneficiarios: { selecciones: unknown }[];
      };
      const hijos = c.beneficiarios ?? [];
      const p = hijos.filter((h) => {
        const s = Array.isArray(h.selecciones) ? h.selecciones.length > 0 : Boolean(h.selecciones);
        return !s;
      }).length;
      return { nombre: c.nombre, area: c.area, pendientes: p };
    })
    .filter((c) => c.pendientes > 0)
    .sort((a, b) => b.pendientes - a.pendientes);

  const t = total ?? 0;
  const c = confirmados ?? 0;

  const { subject, html, text } = plantillaResumenDiario({
    marca: (empresa as { nombre: string }).nombre,
    fecha: larga,
    porcentaje: t > 0 ? Math.round((1000 * c) / t) / 10 : 0,
    confirmados: c,
    pendientes: t - c,
    confirmadosHoy: confirmadosHoy ?? 0,
    agotadas,
    porAgotarse,
    colaboradoresPendientes: pendientes,
  });

  const envio = await enviarCorreo({ to: destino, subject, html, text });
  return NextResponse.json({ ok: envio.ok, id: envio.id, error: envio.error });
}

export const GET = handler;
export const POST = handler;
