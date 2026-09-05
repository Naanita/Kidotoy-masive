"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface Resultado {
  ok: boolean;
  error?: string;
}

/** Extrae el código de error de negocio del mensaje de Postgres. */
function codigoError(msg: string, conocidos: string[]): string {
  return conocidos.find((c) => msg.includes(c)) ?? "ERROR";
}

const MENSAJE: Record<string, string> = {
  NO_AUTORIZADO: "No tienes permiso para esta acción.",
  STOCK_INVALIDO: "La cantidad no es válida.",
  PRODUCTO_NO_EXISTE: "La referencia no existe.",
  MOTIVO_REQUERIDO: "El motivo debe tener al menos 10 caracteres.",
  YA_ENTREGADO: "No se puede liberar: el regalo ya fue entregado.",
  SELECCION_NO_EXISTE: "La selección ya no existe.",
  ENTREGA_NO_EXISTE: "Esa selección no está marcada como entregada.",
  CODIGO_DUPLICADO: "Ya existe una referencia con ese código.",
  DATOS_INCOMPLETOS: "Faltan datos obligatorios.",
  GENERO_INVALIDO: "El género no es válido.",
  EDAD_INVALIDA: "La edad no es válida.",
  ERROR: "No se pudo completar la acción. Inténtalo de nuevo.",
};

/** Edición de stock. El mínimo (lo consumido) lo garantiza la base. */
export async function actualizarStock(
  _prev: Resultado,
  formData: FormData,
): Promise<Resultado> {
  const productoId = String(formData.get("producto_id") ?? "");
  const nuevo = Number(formData.get("stock_inicial"));
  if (!productoId || !Number.isInteger(nuevo) || nuevo < 0) {
    return { ok: false, error: MENSAJE.STOCK_INVALIDO };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("actualizar_stock", {
    p_producto_id: productoId,
    p_nuevo_inicial: nuevo,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("STOCK_MENOR_QUE_CONSUMIDO")) {
      const min = msg.split(":")[1]?.trim();
      return {
        ok: false,
        error: `No puedes fijar menos de ${min ?? "lo ya consumido"} unidades: esas ya están confirmadas.`,
      };
    }
    return {
      ok: false,
      error: MENSAJE[codigoError(msg, Object.keys(MENSAJE))] ?? MENSAJE.ERROR,
    };
  }

  revalidatePath("/kidotoy/inventario");
  revalidatePath("/kidotoy/panel");
  return { ok: true };
}

/** Liberar una selección con motivo obligatorio (>= 10, verificado en la base). */
export async function liberarSeleccion(
  _prev: Resultado,
  formData: FormData,
): Promise<Resultado> {
  const seleccionId = String(formData.get("seleccion_id") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim();
  if (!seleccionId) return { ok: false, error: MENSAJE.ERROR };
  if (motivo.length < 10) return { ok: false, error: MENSAJE.MOTIVO_REQUERIDO };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("liberar_seleccion", {
    p_seleccion_id: seleccionId,
    p_motivo: motivo,
  });

  if (error) {
    const msg = error.message ?? "";
    return {
      ok: false,
      error: MENSAJE[codigoError(msg, Object.keys(MENSAJE))] ?? MENSAJE.ERROR,
    };
  }

  revalidatePath("/kidotoy/selecciones");
  revalidatePath("/kidotoy/inventario");
  revalidatePath("/kidotoy/panel");
  return { ok: true };
}

/** Revertir una entrega marcada por error. Motivo >= 10, auditoría, admin-only. */
export async function revertirEntrega(
  _prev: Resultado,
  formData: FormData,
): Promise<Resultado> {
  const seleccionId = String(formData.get("seleccion_id") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim();
  if (!seleccionId) return { ok: false, error: MENSAJE.ERROR };
  if (motivo.length < 10) return { ok: false, error: MENSAJE.MOTIVO_REQUERIDO };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("revertir_entrega", {
    p_seleccion_id: seleccionId,
    p_motivo: motivo,
  });

  if (error) {
    const msg = error.message ?? "";
    return {
      ok: false,
      error: MENSAJE[codigoError(msg, Object.keys(MENSAJE))] ?? MENSAJE.ERROR,
    };
  }

  revalidatePath("/kidotoy/entregas");
  revalidatePath("/kidotoy/panel");
  return { ok: true };
}

/** Alta o edición de una referencia del catálogo. */
export async function guardarProducto(
  _prev: Resultado,
  formData: FormData,
): Promise<Resultado> {
  const id = String(formData.get("producto_id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "");
  const imagenUrl = String(formData.get("imagen_url") ?? "");
  const activo = formData.get("activo") === "on" || formData.get("activo") === "true";
  if (!nombre) return { ok: false, error: MENSAJE.DATOS_INCOMPLETOS };

  const supabase = await createSupabaseServerClient();

  if (id) {
    const { error } = await supabase.rpc("actualizar_producto", {
      p_producto_id: id,
      p_nombre: nombre,
      p_descripcion: descripcion,
      p_imagen_url: imagenUrl,
      p_activo: activo,
    });
    if (error) {
      const msg = error.message ?? "";
      return {
        ok: false,
        error: MENSAJE[codigoError(msg, Object.keys(MENSAJE))] ?? MENSAJE.ERROR,
      };
    }
  } else {
    const { error } = await supabase.rpc("crear_producto", {
      p_codigo_referencia: String(formData.get("codigo_referencia") ?? "").trim(),
      p_nombre: nombre,
      p_edad: Number(formData.get("edad")),
      p_genero: String(formData.get("genero") ?? ""),
      p_stock_inicial: Number(formData.get("stock_inicial")),
      p_sku: String(formData.get("sku") ?? ""),
      p_descripcion: descripcion,
      p_imagen_url: imagenUrl,
    });
    if (error) {
      const msg = error.message ?? "";
      return {
        ok: false,
        error: MENSAJE[codigoError(msg, Object.keys(MENSAJE))] ?? MENSAJE.ERROR,
      };
    }
  }

  revalidatePath("/kidotoy/catalogo");
  revalidatePath("/kidotoy/inventario");
  revalidatePath("/kidotoy/panel");
  return { ok: true };
}
