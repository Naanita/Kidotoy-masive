import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase infiere las relaciones embebidas como arreglos aunque sean a-uno.
 * Este helper devuelve el único elemento (o el objeto tal cual, o null).
 */
function unoDeRelacion(rel: unknown): unknown {
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel ?? null;
}

export type Genero = "Niño" | "Niña";

export interface Beneficiario {
  id: string;
  nombre: string;
  edad: number;
  genero: Genero;
}

export interface BeneficiarioConEstado extends Beneficiario {
  seleccion: { codigo_entrega: string; producto: string } | null;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  stock_disponible: number;
  codigo_referencia: string;
}

export interface Comprobante {
  codigo_entrega: string;
  confirmada_en: string;
  beneficiario: string;
  edad: number;
  producto: string;
  imagen_url: string | null;
}

/**
 * Beneficiarios del colaborador con su estado (pendiente / confirmado).
 * RLS (benef_propios, selec_propias) garantiza que solo ve a SUS hijos y a SUS
 * selecciones; no hace falta filtrar por colaborador en la app.
 */
export async function obtenerBeneficiarios(): Promise<BeneficiarioConEstado[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("beneficiarios")
    .select("id, nombre, edad, genero, selecciones(codigo_entrega, productos(nombre))")
    .order("edad", { ascending: true })
    .order("nombre", { ascending: true });

  if (error || !data) return [];

  return (data as unknown[]).map((row): BeneficiarioConEstado => {
    const b = row as {
      id: string;
      nombre: string;
      edad: number;
      genero: Genero;
      selecciones: unknown;
    };
    const s = unoDeRelacion(b.selecciones) as
      | { codigo_entrega: string; productos: unknown }
      | null;
    const prod = s ? (unoDeRelacion(s.productos) as { nombre: string } | null) : null;
    return {
      id: b.id,
      nombre: b.nombre,
      edad: b.edad,
      genero: b.genero,
      seleccion: s
        ? { codigo_entrega: s.codigo_entrega, producto: prod?.nombre ?? "" }
        : null,
    };
  });
}

export async function obtenerBeneficiario(
  id: string,
): Promise<Beneficiario | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("beneficiarios")
    .select("id, nombre, edad, genero")
    .eq("id", id)
    .maybeSingle();
  return (data as Beneficiario | null) ?? null;
}

/** Las 6 referencias de la edad EXACTA y el género. Nunca por rango. */
export async function obtenerCatalogo(
  edad: number,
  genero: string,
): Promise<Producto[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("productos")
    .select("id, nombre, descripcion, imagen_url, stock_disponible, codigo_referencia")
    .eq("edad", edad)
    .eq("genero", genero)
    .eq("activo", true)
    .order("codigo_referencia", { ascending: true });
  return (data as Producto[] | null) ?? [];
}

export interface ProductoDetalle extends Producto {
  edad: number;
  genero: Genero;
}

export async function obtenerProducto(
  id: string,
): Promise<ProductoDetalle | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("productos")
    .select(
      "id, nombre, descripcion, imagen_url, stock_disponible, codigo_referencia, edad, genero",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as ProductoDetalle | null) ?? null;
}

/** Comprobante ya confirmado. No caduca: se lee sin importar la ventana. */
export async function obtenerComprobante(
  beneficiarioId: string,
): Promise<Comprobante | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("selecciones")
    .select(
      "codigo_entrega, confirmada_en, beneficiarios(nombre, edad), productos(nombre, imagen_url)",
    )
    .eq("beneficiario_id", beneficiarioId)
    .maybeSingle();

  if (!data) return null;
  const d = data as {
    codigo_entrega: string;
    confirmada_en: string;
    beneficiarios: unknown;
    productos: unknown;
  };
  const b = unoDeRelacion(d.beneficiarios) as {
    nombre: string;
    edad: number;
  } | null;
  const p = unoDeRelacion(d.productos) as {
    nombre: string;
    imagen_url: string | null;
  } | null;
  return {
    codigo_entrega: d.codigo_entrega,
    confirmada_en: d.confirmada_en,
    beneficiario: b?.nombre ?? "",
    edad: b?.edad ?? 0,
    producto: p?.nombre ?? "",
    imagen_url: p?.imagen_url ?? null,
  };
}
