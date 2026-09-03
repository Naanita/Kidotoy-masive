import { createClient } from "@supabase/supabase-js";

/**
 * Cliente anónimo sin sesión ni cookies. Se usa para llamadas públicas y
 * seguras: config_publica() (tema + marca + banner) y ping() (keepalive).
 * Nunca lleva la service role key: es la anon key, la misma que ve el navegador.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env.local.",
    );
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
