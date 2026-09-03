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
