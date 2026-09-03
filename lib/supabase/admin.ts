import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la SERVICE ROLE KEY. Salta RLS por completo.
 *
 * SOLO en servidor y SOLO para operaciones administrativas de confianza
 * (importación de colaboradores, resumen diario, tareas de /dev). NUNCA en
 * una ruta pública sin autenticar, NUNCA expuesto al navegador. El import
 * "server-only" hace fallar el build si alguien lo arrastra al cliente.
 *
 * En Fase 0 no lo usa ninguna ruta; queda listo para fases posteriores.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para el cliente administrativo.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
