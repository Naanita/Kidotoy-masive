import { createSupabaseServerClient } from "@/lib/supabase/server";

function uno<T>(rel: unknown): T | null {
  if (Array.isArray(rel)) return (rel[0] as T) ?? null;
  return (rel as T) ?? null;
}

export interface CarpaConfig {
  id: string;
  nombre: string;
  orden: number;
  referencias: number;
}

export interface ReferenciaCarpa {
  productoId: string;
  codigo: string;
  nombre: string;
  edad: number;
  genero: string;
  activo: boolean;
  carpaId: string | null;
  carpaNombre: string | null;
}

export interface OperarioConfig {
  authUserId: string;
  nombre: string;
  correo: string | null;
  carpaId: string | null;
  carpaNombre: string | null;
}

export async function obtenerCarpas(empresaId: string): Promise<CarpaConfig[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: carpas }, { data: asign }] = await Promise.all([
    supabase.from("carpas").select("id, nombre, orden").eq("empresa_id", empresaId).order("orden"),
    supabase.from("carpa_referencias").select("carpa_id").eq("empresa_id", empresaId),
  ]);
  const conteo = new Map<string, number>();
  for (const a of (asign as { carpa_id: string }[]) ?? []) {
    conteo.set(a.carpa_id, (conteo.get(a.carpa_id) ?? 0) + 1);
  }
  return ((carpas as { id: string; nombre: string; orden: number }[]) ?? []).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    orden: c.orden,
    referencias: conteo.get(c.id) ?? 0,
  }));
}

/** Todas las referencias activas con su carpa asignada (o null = sin carpa). */
export async function obtenerReferenciasConCarpa(
  empresaId: string,
): Promise<ReferenciaCarpa[]> {
  const supabase = await createSupabaseServerClient();
  const [{ data: productos }, { data: asign }] = await Promise.all([
    supabase
      .from("productos")
      .select("id, codigo_referencia, nombre, edad, genero, activo")
      .eq("empresa_id", empresaId)
      .order("edad")
      .order("genero")
      .order("codigo_referencia"),
    supabase
      .from("carpa_referencias")
      .select("producto_id, carpa_id, carpas(nombre)")
      .eq("empresa_id", empresaId),
  ]);

  const carpaDe = new Map<string, { id: string; nombre: string }>();
  for (const row of (asign as unknown[]) ?? []) {
    const a = row as { producto_id: string; carpa_id: string; carpas: unknown };
    const c = uno<{ nombre: string }>(a.carpas);
    carpaDe.set(a.producto_id, { id: a.carpa_id, nombre: c?.nombre ?? "" });
  }

  return (
    (productos as {
      id: string;
      codigo_referencia: string;
      nombre: string;
      edad: number;
      genero: string;
      activo: boolean;
    }[]) ?? []
  ).map((p) => {
    const carpa = carpaDe.get(p.id) ?? null;
    return {
      productoId: p.id,
      codigo: p.codigo_referencia,
      nombre: p.nombre,
      edad: p.edad,
      genero: p.genero,
      activo: p.activo,
      carpaId: carpa?.id ?? null,
      carpaNombre: carpa?.nombre ?? null,
    };
  });
}

export async function obtenerOperarios(empresaId: string): Promise<OperarioConfig[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("operarios")
    .select("auth_user_id, nombre, correo, carpa_id, carpas(nombre)")
    .eq("empresa_id", empresaId)
    .order("nombre");

  return ((data as unknown[]) ?? []).map((row): OperarioConfig => {
    const o = row as {
      auth_user_id: string;
      nombre: string;
      correo: string | null;
      carpa_id: string | null;
      carpas: unknown;
    };
    const c = uno<{ nombre: string }>(o.carpas);
    return {
      authUserId: o.auth_user_id,
      nombre: o.nombre,
      correo: o.correo,
      carpaId: o.carpa_id,
      carpaNombre: c?.nombre ?? null,
    };
  });
}
