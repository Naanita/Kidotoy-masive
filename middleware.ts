import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { zonaDeRuta, homeDeRol } from "@/lib/auth/config";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Protege cada espacio según el rol de app_metadata y refresca la sesión.
 * El aislamiento fuerte vive en RLS; esto es la primera barrera de navegación:
 *  - Ruta protegida de un espacio sin el rol correcto → a su login.
 *  - Ya autenticado en el login de su espacio → a su home.
 *  - Autenticado con otro rol → a la home de SU espacio.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser valida el JWT contra el servidor de Auth (no confiar en getSession).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const rol = user?.app_metadata?.rol as string | undefined;
  const { pathname } = request.nextUrl;

  // Lleva las cookies refrescadas a cualquier redirección para no perder sesión.
  const redirigir = (destino: string) => {
    const r = NextResponse.redirect(new URL(destino, request.url));
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  const zona = zonaDeRuta(pathname);
  if (zona) {
    const esLogin = pathname === zona.prefijo;
    if (esLogin) {
      if (user && rol === zona.rol) return redirigir(zona.home);
      if (user && rol && rol !== zona.rol) {
        const home = homeDeRol(rol);
        if (home) return redirigir(home);
      }
    } else if (!user || rol !== zona.rol) {
      // Dentro del espacio pero sin el rol: fuera, a la página de login.
      return redirigir(zona.prefijo);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Todo menos assets estáticos y /api (el keepalive no debe pasar por aquí).
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
