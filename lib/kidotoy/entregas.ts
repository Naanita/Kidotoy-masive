import { createSupabaseServerClient } from "@/lib/supabase/server";

function uno<T>(rel: unknown): T | null {
  if (Array.isArray(rel)) return (rel[0] as T) ?? null;
  return (rel as T) ?? null;
}

export interface FilaEntregaGestion {
  seleccionId: string;
  codigo: string;
  beneficiario: string;
  edad: number;
  carpaId: string | null;
  carpaNombre: string | null; // carpa asignada de la referencia
  genero: string;
  colaborador: string;
  cedula: string;
  producto: string;
  entregado: boolean;
  operario: string | null;
  entregadoEn: string | null;
  fueraDeCarpa: boolean;
}

export interface CarpaResumen {
  carpaId: string | null;
  carpaNombre: string;
  confirmadas: number;
  entregadas: number;
  pendientes: number;
}

export interface ResumenEntregas {
  confirmadas: number;
  entregadas: number;
  pendientes: number;
  porcentaje: number;
  fueraDeCarpa: number;
  porCarpa: CarpaResumen[];
}

/**
 * Todas las selecciones confirmadas con su estado de entrega y la carpa ASIGNADA
 * a su referencia. El avance por carpa usa esa carpa (no la edad).
 */
export async function obtenerFilasEntregaGestion(
  empresaId: string,
): Promise<FilaEntregaGestion[]> {
  const supabase = await createSupabaseServerClient();

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
      "id, codigo_entrega, producto_id, beneficiarios(nombre, edad, genero, colaboradores(nombre, cedula)), productos(nombre), entregas(entregado_en, operario, fuera_de_carpa)",
    )
    .eq("empresa_id", empresaId);

  return ((data as unknown[]) ?? []).map((row): FilaEntregaGestion => {
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
    const p = uno<{ nombre: string }>(s.productos);
    const e = uno<{ entregado_en: string; operario: string | null; fuera_de_carpa: boolean }>(
      s.entregas,
    );
    const carpa = carpaDe.get(s.producto_id) ?? null;
    return {
      seleccionId: s.id,
      codigo: s.codigo_entrega,
      beneficiario: b?.nombre ?? "",
      edad: b?.edad ?? 0,
      carpaId: carpa?.id ?? null,
      carpaNombre: carpa?.nombre ?? null,
      genero: b?.genero ?? "",
      colaborador: col?.nombre ?? "",
      cedula: col?.cedula ?? "",
      producto: p?.nombre ?? "",
      entregado: Boolean(e),
      operario: e?.operario ?? null,
      entregadoEn: e?.entregado_en ?? null,
      fueraDeCarpa: e?.fuera_de_carpa ?? false,
    };
  });
}

/** Resumen total y por carpa configurada. */
export function resumirEntregas(filas: FilaEntregaGestion[]): ResumenEntregas {
  const confirmadas = filas.length;
  const entregadas = filas.filter((f) => f.entregado).length;
  const fueraDeCarpa = filas.filter((f) => f.entregado && f.fueraDeCarpa).length;

  const claves = new Map<string, { nombre: string; id: string | null }>();
  for (const f of filas) {
    const k = f.carpaId ?? "__sin__";
    if (!claves.has(k)) claves.set(k, { nombre: f.carpaNombre ?? "Sin carpa", id: f.carpaId });
  }
  const porCarpa: CarpaResumen[] = [...claves.entries()]
    .map(([k, meta]) => {
      const enCarpa = filas.filter((f) => (f.carpaId ?? "__sin__") === k);
      const ent = enCarpa.filter((f) => f.entregado).length;
      return {
        carpaId: meta.id,
        carpaNombre: meta.nombre,
        confirmadas: enCarpa.length,
        entregadas: ent,
        pendientes: enCarpa.length - ent,
      };
    })
    .sort((a, b) => a.carpaNombre.localeCompare(b.carpaNombre));

  return {
    confirmadas,
    entregadas,
    pendientes: confirmadas - entregadas,
    porcentaje: confirmadas > 0 ? Math.round((1000 * entregadas) / confirmadas) / 10 : 0,
    fueraDeCarpa,
    porCarpa,
  };
}

/** Últimas entregas registradas, más recientes primero. */
export function ultimasEntregas(
  filas: FilaEntregaGestion[],
  limite = 15,
): FilaEntregaGestion[] {
  return filas
    .filter((f) => f.entregado && f.entregadoEn)
    .sort((a, b) => (a.entregadoEn! < b.entregadoEn! ? 1 : -1))
    .slice(0, limite);
}
