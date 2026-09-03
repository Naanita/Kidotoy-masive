import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Cliente para componentes de servidor y server actions autenticadas.
 * Lee la sesión del colaborador/admin desde las cookies (Next 15: async).
 * El aislamiento entre empresas lo garantiza RLS con el JWT de esta sesión.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Llamado desde un Server Component sin respuesta mutable:
            // el middleware se encarga de refrescar la sesión. Se ignora.
          }
        },
      },
    },
  );
}
