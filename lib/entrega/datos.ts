import { createSupabaseServerClient } from "@/lib/supabase/server";

function uno<T>(rel: unknown): T | null {
  if (Array.isArray(rel)) return (rel[0] as T) ?? null;
  return (rel as T) ?? null;
}

export interface CarpaOperario {
  carpaId: string | null;
  carpaNombre: string | null;
}

export interface FichaEntrega {
  seleccionId: string;
  codigo: string;
  beneficiario: string;
  edad: number;
  genero: string;
  carpaId: string | null;
  carpaNombre: string | null; // carpa asignada de la referencia (null = sin carpa)
  colaborador: string;
  cedula: string;
  producto: string;
  imagenUrl: string | null;
  entrega: { entregadoEn: string; operario: string | null } | null;
}

/** Carpa donde trabaja el operario de la sesión actual. */
export async function obtenerCarpaOperario(): Promise<CarpaOperario> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { carpaId: null, carpaNombre: null };

  const { data } = await supabase
    .from("operarios")
    .select("carpa_id, carpas(nombre)")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!data) return { carpaId: null, carpaNombre: null };

  const carpa = uno<{ nombre: string }>((data as { carpas: unknown }).carpas);
  return {
    carpaId: (data as { carpa_id: string | null }).carpa_id,
    carpaNombre: carpa?.nombre ?? null,
  };
}

/**
 * Busca selecciones confirmadas por código de entrega, cédula del colaborador o
 * nombre. La carpa que devuelve es la ASIGNADA a la referencia (dónde se
 * despacha el juguete), no la edad.
 */
export async function buscarParaEntrega(
  empresaId: string,
  q: string,
): Promise<FichaEntrega[]> {
  const termino = q.trim().toLowerCase();
  if (!termino) return [];

  const supabase = await createSupabaseServerClient();

  // Mapa referencia → carpa (para saber dónde se despacha cada juguete).
  const { data: asign } = await supabase
    .from("carpa_referencias")
    .select("producto_id, carpa_id, carpas(nombre)")
    .eq("empresa_id", empresaId);
  const carpaDe = new Map<string, { id: string; nombre: string }>();
  for (const row of (asign as unknown[]) ?? []) {
    const a = row as { producto_id: string; carpa_id: string; carpas: unknown };
    const c = uno<{ nombre: string }>(a.carpas);
    carpaDe.set(a.producto_id, { id: a.carpa_id, nombre: c?.nombre ?? "" });
  }

  const { data } = await supabase
    .from("selecciones")
    .select(
      "id, codigo_entrega, producto_id, beneficiarios(nombre, edad, genero, colaboradores(nombre, cedula)), productos(nombre, imagen_url), entregas(entregado_en, operario)",
    )
    .eq("empresa_id", empresaId);

  const fichas = ((data as unknown[]) ?? []).map((row): FichaEntrega => {
    const s = row as {
      id: string;
      codigo_entrega: string;
      producto_id: string;
      beneficiarios: unknown;
      productos: unknown;
      entregas: unknown;
    };
    const b = uno<{ nombre: string; edad: number; genero: string; colaboradores: unknown }>(
      s.beneficiarios,
    );
    const col = b ? uno<{ nombre: string; cedula: string }>(b.colaboradores) : null;
    const p = uno<{ nombre: string; imagen_url: string | null }>(s.productos);
    const e = uno<{ entregado_en: string; operario: string | null }>(s.entregas);
    const carpa = carpaDe.get(s.producto_id) ?? null;
    return {
      seleccionId: s.id,
      codigo: s.codigo_entrega,
      beneficiario: b?.nombre ?? "",
      edad: b?.edad ?? 0,
      genero: b?.genero ?? "",
      carpaId: carpa?.id ?? null,
      carpaNombre: carpa?.nombre ?? null,
      colaborador: col?.nombre ?? "",
      cedula: col?.cedula ?? "",
      producto: p?.nombre ?? "",
      imagenUrl: p?.imagen_url ?? null,
      entrega: e ? { entregadoEn: e.entregado_en, operario: e.operario } : null,
    };
  });

  return fichas.filter((f) => {
    if (f.codigo.toLowerCase() === termino) return true;
    if (f.cedula.toLowerCase() === termino) return true;
    const blob = `${f.codigo} ${f.cedula} ${f.beneficiario} ${f.colaborador}`.toLowerCase();
    return blob.includes(termino);
  });
}

/** Total de entregas registradas (contador de la jornada, siempre visible). */
export async function contarEntregas(empresaId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("entregas")
    .select("id", { count: "exact", head: true })
    .eq("empresa_id", empresaId);
  return count ?? 0;
}
