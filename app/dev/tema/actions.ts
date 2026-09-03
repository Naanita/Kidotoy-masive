"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { obtenerContexto } from "@/lib/auth/session";
import { TOKEN_SPECS } from "@/lib/theme/tokens";

export interface ResultadoTema {
  ok: boolean;
  error?: string;
}

/**
 * Guarda el tema de la empresa. EXPLÍCITO: solo se escribe la base cuando el
 * usuario da a guardar (la vista previa nunca toca la BD). Solo admin_dev, lo
 * garantiza también la RLS (tema_escritura). Se filtran las claves a la lista
 * blanca antes de almacenar; el saneo final ocurre al inyectar en el layout.
 */
export async function guardarTema(
  overrides: Record<string, string>,
): Promise<ResultadoTema> {
  const { empresaId, rol } = await obtenerContexto();
  if (!empresaId) return { ok: false, error: "Sin sesión." };
  if (rol !== "admin_dev") return { ok: false, error: "No autorizado." };

  const limpio: Record<string, string> = {};
  for (const [k, v] of Object.entries(overrides ?? {})) {
    if (k in TOKEN_SPECS && typeof v === "string" && v.trim() !== "") {
      limpio[k] = v;
    }
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tema")
    .upsert(
      { empresa_id: empresaId, tokens: limpio, actualizado_en: new Date().toISOString() },
      { onConflict: "empresa_id" },
    );

  if (error) return { ok: false, error: error.message };

  // El layout raíz lee el tema; refrescar todo para que se vea el cambio.
  revalidatePath("/", "layout");
  return { ok: true };
}
