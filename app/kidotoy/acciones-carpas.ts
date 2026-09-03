"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { obtenerContexto } from "@/lib/auth/session";

export interface Resultado {
  ok: boolean;
  error?: string;
}

function revalidarCarpas() {
  revalidatePath("/kidotoy/carpas");
  revalidatePath("/kidotoy/operarios");
  revalidatePath("/kidotoy/entregas");
}

export async function crearCarpa(nombre: string): Promise<Resultado> {
  const { empresaId } = await obtenerContexto();
  const n = nombre.trim();
  if (!empresaId) return { ok: false, error: "Sin sesión." };
  if (!n) return { ok: false, error: "El nombre es obligatorio." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("carpas")
    .insert({ empresa_id: empresaId, nombre: n, orden: 99 });
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Ya existe una carpa con ese nombre." : "No se pudo crear.",
    };
  }
  revalidarCarpas();
  return { ok: true };
}

export async function renombrarCarpa(id: string, nombre: string): Promise<Resultado> {
  const n = nombre.trim();
  if (!n) return { ok: false, error: "El nombre es obligatorio." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("carpas").update({ nombre: n }).eq("id", id);
  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Ya existe una carpa con ese nombre." : "No se pudo renombrar.",
    };
  }
  revalidarCarpas();
  return { ok: true };
}

export async function eliminarCarpa(id: string): Promise<Resultado> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("carpas").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };
  revalidarCarpas();
  return { ok: true };
}

/** Asigna una referencia a una carpa. carpaId null = quitar la asignación. */
export async function asignarReferencia(
  productoId: string,
  carpaId: string | null,
): Promise<Resultado> {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) return { ok: false, error: "Sin sesión." };
  const supabase = await createSupabaseServerClient();

  if (!carpaId) {
    const { error } = await supabase
      .from("carpa_referencias")
      .delete()
      .eq("producto_id", productoId);
    if (error) return { ok: false, error: "No se pudo quitar la asignación." };
  } else {
    const { error } = await supabase
      .from("carpa_referencias")
      .upsert(
        { producto_id: productoId, carpa_id: carpaId, empresa_id: empresaId },
        { onConflict: "producto_id" },
      );
    if (error) return { ok: false, error: "No se pudo asignar." };
  }
  revalidarCarpas();
  revalidatePath("/kidotoy/panel");
  return { ok: true };
}

export async function asignarOperarioCarpa(
  authUserId: string,
  carpaId: string | null,
): Promise<Resultado> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("operarios")
    .update({ carpa_id: carpaId })
    .eq("auth_user_id", authUserId);
  if (error) return { ok: false, error: "No se pudo asignar la carpa." };
  revalidarCarpas();
  return { ok: true };
}

/**
 * Crea una cuenta de operario. Necesita la service role key (crear usuario de
 * Auth), por eso se valida primero que quien llama sea admin. Nunca se expone la
 * clave al cliente: todo ocurre en el servidor.
 */
export async function crearOperario(datos: {
  correo: string;
  password: string;
  nombre: string;
  carpaId: string | null;
}): Promise<Resultado> {
  const { empresaId, rol } = await obtenerContexto();
  if (!empresaId) return { ok: false, error: "Sin sesión." };
  if (rol !== "admin_kidotoy" && rol !== "admin_dev") {
    return { ok: false, error: "No autorizado." };
  }
  const correo = datos.correo.trim().toLowerCase();
  const nombre = datos.nombre.trim();
  if (!correo || !datos.password || !nombre) {
    return { ok: false, error: "Correo, contraseña y nombre son obligatorios." };
  }
  if (datos.password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const admin = createSupabaseAdminClient();
  const { data: creado, error: eCrear } = await admin.auth.admin.createUser({
    email: correo,
    password: datos.password,
    email_confirm: true,
    app_metadata: { empresa_id: empresaId, rol: "operario_entrega" },
  });
  if (eCrear || !creado.user) {
    const msg = eCrear?.message ?? "";
    return {
      ok: false,
      error: /already|registered|exists/i.test(msg)
        ? "Ya existe una cuenta con ese correo."
        : "No se pudo crear la cuenta.",
    };
  }

  const { error: eOp } = await admin.from("operarios").insert({
    auth_user_id: creado.user.id,
    empresa_id: empresaId,
    nombre,
    correo,
    carpa_id: datos.carpaId,
  });
  if (eOp) return { ok: false, error: "Cuenta creada, pero no se pudo guardar el operario." };

  revalidarCarpas();
  return { ok: true };
}
