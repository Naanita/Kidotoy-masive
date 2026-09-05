import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Relación embebida a-uno que Supabase devuelve como arreglo. */
function uno<T>(rel: unknown): T | null {
  if (Array.isArray(rel)) return (rel[0] as T) ?? null;
  return (rel as T) ?? null;
}

const UMBRAL_STOCK_BAJO = 0.2; // por debajo del 20% = "por agotarse"

export interface Resumen {
  total: number;
  confirmados: number;
  pendientes: number;
  porcentaje: number;
  agotadas: number;
  porAgotarse: number;
}

export interface FilaSeleccion {
  beneficiarioId: string;
  seleccionId: string | null;
  beneficiario: string;
  edad: number;
  genero: string;
  colaborador: string;
  cedula: string;
  area: string | null;
  producto: string | null;
  codigoEntrega: string | null;
  confirmadaEn: string | null;
  estado: "confirmado" | "pendiente";
}

export interface GrupoInventario {
  edad: number;
  genero: string;
  referencias: number;
  iniciales: number;
  disponibles: number;
  consumidas: number;
}

export interface ProductoAdmin {
  id: string;
  codigo_referencia: string;
  sku: string | null;
  nombre: string;
  descripcion: string | null;
  edad: number;
  genero: string;
  stock_inicial: number;
  stock_disponible: number;
  consumido: number;
  imagen_url: string | null;
  activo: boolean;
}

export type EstadoCobertura =
  | "completo"
  | "suficiente"
  | "ajustado"
  | "critico"
  | "sin_referencias";

export interface CoberturaGrupo {
  edad: number;
  genero: string;
  referencias: number;
  disponibles: number;
  consumidas: number;
  beneficiarios: number;
  pendientes: number;
  estado: EstadoCobertura;
}

export interface Cobertura {
  grupos: CoberturaGrupo[];
  criticos: number;
  ajustados: number;
  /** Grupos de producción (0–13 × 2) SIN ninguna referencia asignada. En el
   *  piloto el catálogo es una muestra de 4 grupos, así que esto avisa cuántos
   *  faltan por surtir antes de producción (un niño de ese grupo vería vacío). */
  sinReferencias: number;
  /** Momento en que se calculó (la demanda pendiente baja sola al confirmar). */
  actualizadoEn: string;
}

export interface DiaEvolucion {
  fecha: string;
  acumulado: number;
  pct: number;
}

export interface ColaboradorPendiente {
  id: string;
  nombre: string;
  cedula: string;
  area: string | null;
  correo: string | null;
  pendientes: number;
  total: number;
}

/** Trae todos los productos de la empresa (base de inventario y catálogo). */
export async function obtenerProductosAdmin(
  empresaId: string,
): Promise<ProductoAdmin[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("productos")
    .select(
      "id, codigo_referencia, sku, nombre, descripcion, edad, genero, stock_inicial, stock_disponible, imagen_url, activo",
    )
    .eq("empresa_id", empresaId)
    .order("edad", { ascending: true })
    .order("genero", { ascending: true })
    .order("codigo_referencia", { ascending: true });

  return ((data as Omit<ProductoAdmin, "consumido">[] | null) ?? []).map((p) => ({
    ...p,
    consumido: p.stock_inicial - p.stock_disponible,
  }));
}

/** Las tres preguntas diarias en números: avance, agotándose, y (aparte) pendientes. */
export async function obtenerResumen(empresaId: string): Promise<Resumen> {
  const supabase = await createSupabaseServerClient();
  const [{ count: total }, { count: confirmados }, productos] = await Promise.all([
    supabase
      .from("beneficiarios")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId),
    supabase
      .from("selecciones")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId),
    obtenerProductosAdmin(empresaId),
  ]);

  const t = total ?? 0;
  const c = confirmados ?? 0;
  const activos = productos.filter((p) => p.activo);
  const agotadas = activos.filter((p) => p.stock_disponible === 0).length;
  const porAgotarse = activos.filter(
    (p) =>
      p.stock_disponible > 0 &&
      p.stock_disponible < p.stock_inicial * UMBRAL_STOCK_BAJO,
  ).length;

  return {
    total: t,
    confirmados: c,
    pendientes: t - c,
    porcentaje: t > 0 ? Math.round((1000 * c) / t) / 10 : 0,
    agotadas,
    porAgotarse,
  };
}

/** Inventario agrupado por edad y género (vista v_inventario_por_grupo). */
export async function obtenerInventarioGrupos(
  empresaId: string,
): Promise<GrupoInventario[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("v_inventario_por_grupo")
    .select("edad, genero, referencias, unidades_iniciales, unidades_disponibles, unidades_consumidas")
    .eq("empresa_id", empresaId)
    .order("edad", { ascending: true })
    .order("genero", { ascending: true });

  return (
    (data as
      | {
          edad: number;
          genero: string;
          referencias: number;
          unidades_iniciales: number;
          unidades_disponibles: number;
          unidades_consumidas: number;
        }[]
      | null) ?? []
  ).map((g) => ({
    edad: g.edad,
    genero: g.genero,
    referencias: g.referencias,
    iniciales: g.unidades_iniciales,
    disponibles: g.unidades_disponibles,
    consumidas: g.unidades_consumidas,
  }));
}

/**
 * COBERTURA por grupo: la pieza más específica del panel. Cruza el INVENTARIO
 * (v_inventario_por_grupo: unidades disponibles) con la DEMANDA real
 * (beneficiarios de ese grupo que todavía no han elegido). Responde "¿alcanza el
 * stock para cada grupo?", que ninguna plantilla contesta.
 *
 * La demanda pendiente BAJA sola a medida que la gente confirma, así que la
 * cobertura mejora sin tocar el inventario: por eso se devuelve `actualizadoEn`.
 */
export async function obtenerCoberturaGrupos(
  empresaId: string,
): Promise<Cobertura> {
  const supabase = await createSupabaseServerClient();
  const [{ data: inv }, { data: benef }] = await Promise.all([
    supabase
      .from("v_inventario_por_grupo")
      .select("edad, genero, referencias, unidades_disponibles, unidades_consumidas")
      .eq("empresa_id", empresaId),
    supabase
      .from("beneficiarios")
      .select("edad, genero, selecciones(id)")
      .eq("empresa_id", empresaId),
  ]);

  const demanda = new Map<string, { total: number; pend: number }>();
  for (const b of (benef as
    | { edad: number; genero: string; selecciones: unknown }[]
    | null) ?? []) {
    const k = `${b.edad}-${b.genero}`;
    const tiene = Array.isArray(b.selecciones)
      ? b.selecciones.length > 0
      : Boolean(b.selecciones);
    const d = demanda.get(k) ?? { total: 0, pend: 0 };
    d.total += 1;
    if (!tiene) d.pend += 1;
    demanda.set(k, d);
  }

  const invMap = new Map<
    string,
    { referencias: number; disponibles: number; consumidas: number }
  >();
  for (const g of (inv as
    | {
        edad: number;
        genero: string;
        referencias: number;
        unidades_disponibles: number;
        unidades_consumidas: number;
      }[]
    | null) ?? []) {
    invMap.set(`${g.edad}-${g.genero}`, {
      referencias: g.referencias,
      disponibles: g.unidades_disponibles,
      consumidas: g.unidades_consumidas,
    });
  }

  // Se recorren los 28 grupos de PRODUCCIÓN (edades 0–13 × 2 géneros), no solo
  // los que hoy tienen datos: así los grupos SIN referencias asignadas se ven en
  // el mapa (en el piloto el catálogo es una muestra de 4 grupos). Un grupo sin
  // referencias con beneficiarios esperando es lo más grave: no pueden elegir.
  const grupos: CoberturaGrupo[] = [];
  for (let edad = 0; edad <= 13; edad++) {
    for (const genero of ["Niño", "Niña"]) {
      const k = `${edad}-${genero}`;
      const i = invMap.get(k) ?? { referencias: 0, disponibles: 0, consumidas: 0 };
      const d = demanda.get(k) ?? { total: 0, pend: 0 };
      let estado: EstadoCobertura;
      if (i.referencias === 0) {
        // Sin catálogo. Si además hay quién espera, es crítico (no pueden elegir).
        estado = d.pend > 0 ? "critico" : "sin_referencias";
      } else if (d.pend === 0) estado = "completo";
      else if (i.disponibles < d.pend) estado = "critico"; // no alcanza (incl. agotado)
      else if (i.disponibles < d.pend * 1.2) estado = "ajustado"; // cubre sin margen
      else estado = "suficiente";
      grupos.push({
        edad,
        genero,
        referencias: i.referencias,
        disponibles: i.disponibles,
        consumidas: i.consumidas,
        beneficiarios: d.total,
        pendientes: d.pend,
        estado,
      });
    }
  }

  grupos.sort((a, b) => a.edad - b.edad || a.genero.localeCompare(b.genero));

  return {
    grupos,
    criticos: grupos.filter((g) => g.estado === "critico").length,
    ajustados: grupos.filter((g) => g.estado === "ajustado").length,
    sinReferencias: grupos.filter((g) => g.estado === "sin_referencias").length,
    actualizadoEn: new Date().toISOString(),
  };
}

/**
 * Evolución de la campaña: confirmaciones acumuladas por día. Para una gráfica de
 * trabajo (SVG a mano), no una pieza decorativa.
 */
export async function obtenerEvolucion(
  empresaId: string,
): Promise<{ dias: DiaEvolucion[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  const [{ data: sels }, { count: total }] = await Promise.all([
    supabase
      .from("selecciones")
      .select("confirmada_en")
      .eq("empresa_id", empresaId)
      .order("confirmada_en", { ascending: true }),
    supabase
      .from("beneficiarios")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId),
  ]);

  const porDia = new Map<string, number>();
  for (const s of (sels as { confirmada_en: string }[] | null) ?? []) {
    const dia = s.confirmada_en.slice(0, 10);
    porDia.set(dia, (porDia.get(dia) ?? 0) + 1);
  }
  const t = total ?? 0;
  let acc = 0;
  const dias = [...porDia.keys()]
    .sort()
    .map((fecha) => {
      acc += porDia.get(fecha) ?? 0;
      return {
        fecha,
        acumulado: acc,
        pct: t > 0 ? Math.round((1000 * acc) / t) / 10 : 0,
      };
    });
  return { dias, total: t };
}

/**
 * Todas las filas de beneficiarios con su estado de selección. La tabla de
 * "Selecciones" del panel se filtra por edad, género, área y estado en la
 * interfaz; aquí se traen completas (RLS acota a la empresa).
 */
export async function obtenerFilasSelecciones(
  empresaId: string,
): Promise<FilaSeleccion[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("beneficiarios")
    .select(
      "id, nombre, edad, genero, colaboradores(nombre, cedula, area), selecciones(id, codigo_entrega, confirmada_en, productos(nombre))",
    )
    .eq("empresa_id", empresaId)
    .order("edad", { ascending: true });

  return ((data as unknown[]) ?? []).map((row): FilaSeleccion => {
    const b = row as {
      id: string;
      nombre: string;
      edad: number;
      genero: string;
      colaboradores: unknown;
      selecciones: unknown;
    };
    const col = uno<{ nombre: string; cedula: string; area: string | null }>(
      b.colaboradores,
    );
    const sel = uno<{
      id: string;
      codigo_entrega: string;
      confirmada_en: string;
      productos: unknown;
    }>(b.selecciones);
    const prod = sel ? uno<{ nombre: string }>(sel.productos) : null;
    return {
      beneficiarioId: b.id,
      seleccionId: sel?.id ?? null,
      beneficiario: b.nombre,
      edad: b.edad,
      genero: b.genero,
      colaborador: col?.nombre ?? "",
      cedula: col?.cedula ?? "",
      area: col?.area ?? null,
      producto: prod?.nombre ?? null,
      codigoEntrega: sel?.codigo_entrega ?? null,
      confirmadaEn: sel?.confirmada_en ?? null,
      estado: sel ? "confirmado" : "pendiente",
    };
  });
}

/** Colaboradores con al menos un hijo sin elegir: "quiénes no han entrado". */
export async function obtenerColaboradoresPendientes(
  empresaId: string,
): Promise<ColaboradorPendiente[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("colaboradores")
    .select("id, nombre, cedula, area, correo, beneficiarios(id, selecciones(id))")
    .eq("empresa_id", empresaId)
    .order("nombre", { ascending: true });

  return ((data as unknown[]) ?? [])
    .map((row): ColaboradorPendiente => {
      const c = row as {
        id: string;
        nombre: string;
        cedula: string;
        area: string | null;
        correo: string | null;
        beneficiarios: { id: string; selecciones: unknown }[];
      };
      const hijos = c.beneficiarios ?? [];
      const pendientes = hijos.filter((h) => {
        const s = Array.isArray(h.selecciones)
          ? h.selecciones.length > 0
          : Boolean(h.selecciones);
        return !s;
      }).length;
      return {
        id: c.id,
        nombre: c.nombre,
        cedula: c.cedula,
        area: c.area,
        correo: c.correo,
        pendientes,
        total: hijos.length,
      };
    })
    .filter((c) => c.pendientes > 0)
    .sort((a, b) => b.pendientes - a.pendientes);
}
