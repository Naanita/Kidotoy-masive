"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notificarSiColaboradorCompleto } from "@/lib/email/confirmacion";

export interface EstadoConfirmacion {
  code: string | null;
}

const CODIGOS = [
  "SIN_STOCK",
  "YA_TIENE_SELECCION",
  "FUERA_DE_VENTANA",
  "NO_AUTORIZADO",
  "BENEFICIARIO_NO_EXISTE",
];

/**
 * Confirma la selección SIEMPRE a través de confirmar_seleccion(): descuento
 * atómico, validación de ventana y "un juguete por beneficiario" viven en la
 * base. Nunca se lee stock ni se decide en el cliente.
 */
export async function confirmarSeleccion(
  _prev: EstadoConfirmacion,
  formData: FormData,
): Promise<EstadoConfirmacion> {
  const beneficiarioId = String(formData.get("beneficiario_id") ?? "");
  const productoId = String(formData.get("producto_id") ?? "");
  if (!beneficiarioId || !productoId) return { code: "ERROR" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("confirmar_seleccion", {
    p_beneficiario_id: beneficiarioId,
    p_producto_id: productoId,
  });

  if (error) {
    const msg = error.message ?? "";
    const code = CODIGOS.find((c) => msg.includes(c)) ?? "ERROR";
    return { code };
  }

  // Correo de confirmación cuando el colaborador completó a todos sus hijos.
  // Best-effort: si falla, la selección ya quedó y el comprobante está listo.
  await notificarSiColaboradorCompleto(beneficiarioId);

  redirect(`/beneficiario/${beneficiarioId}/comprobante`);
}
