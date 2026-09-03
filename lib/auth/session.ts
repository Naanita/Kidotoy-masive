import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Rol } from "./config";

export interface Contexto {
  empresaId: string | null;
  userId: string | null;
  email: string | null;
  rol: Rol | null;
}

/**
 * Contexto de la sesión actual leído del JWT (app_metadata). Se usa para
 * acotar consultas del panel por empresa_id de forma explícita, además de la
 * RLS. Defensa en profundidad: las vistas de Postgres pueden no heredar la RLS
 * del usuario que consulta, así que nunca dependemos solo de ellas.
 */
export async function obtenerContexto(): Promise<Contexto> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return {
    empresaId: (user?.app_metadata?.empresa_id as string) ?? null,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    rol: (user?.app_metadata?.rol as Rol) ?? null,
  };
}
