import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente para componentes de navegador ("use client").
 * Usa la anon key y la sesión guardada en cookies por Supabase Auth.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
