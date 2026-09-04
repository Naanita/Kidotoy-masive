import "server-only";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DOMINIO_COLABORADOR,
  MENSAJE_ACCESO_GENERICO,
  type Rol,
} from "./config";

export interface EstadoAcceso {
  error: string | null;
}

/** IP del cliente, SOLO para auditoría (nunca para contar intentos). */
async function obtenerIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || null;
  return h.get("x-real-ip");
}

/**
 * Acceso del colaborador con cédula + código SAP.
 *
 * Control de intentos (todo del lado del servidor, la verdad vive en
 * intentos_acceso; un contador de navegador no protege de nada porque quien
 * prueba combinaciones abre una pestaña nueva):
 *
 *  1. verificar_intentos(cedula): ventana deslizante de 15 min, 5 fallos.
 *     Si está bloqueada → mismo mensaje genérico, SIN pista de bloqueo.
 *  2. Se valida con Supabase Auth (correo sintético + código SAP).
 *  3. Se registra el intento con su resultado REAL, de forma garantizada
 *     (envuelto en try/catch: aunque la validación lance, el registro corre).
 *     Un fallo grabado es inmutable: no hay forma desde anon de volverlo
 *     'exitoso' y limpiar el historial para burlar el bloqueo.
 */
export async function accederColaborador(
  cedulaRaw: string,
  codigoSapRaw: string,
): Promise<EstadoAcceso> {
  const cedula = cedulaRaw.trim();
  const codigoSap = codigoSapRaw.trim();
  if (!cedula || !codigoSap) return { error: MENSAJE_ACCESO_GENERICO };

  const supabase = await createSupabaseServerClient();
  const ip = await obtenerIp();

  const { data: permitido, error: eVer } = await supabase.rpc(
    "verificar_intentos",
    { p_cedula: cedula },
  );
  // Ante error del gate o bloqueo activo: mismo mensaje, sin distinción.
  if (eVer || permitido === false) return { error: MENSAJE_ACCESO_GENERICO };

  const email = `${cedula}@${DOMINIO_COLABORADOR}`;
  let exitoso = false;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: codigoSap,
    });
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.app_metadata?.rol === "colaborador") {
        exitoso = true;
      } else {
        // Correo válido pero rol equivocado: no es un colaborador.
        await supabase.auth.signOut();
      }
    }
  } catch {
    exitoso = false;
  }

  await supabase.rpc("registrar_intento_acceso", {
    p_cedula: cedula,
    p_exitoso: exitoso,
    p_ip: ip,
  });

  if (!exitoso) return { error: MENSAJE_ACCESO_GENERICO };
  redirect("/acceso/inicio?bienvenido=1");
}

/**
 * Acceso con correo + contraseña (Kidotoy, Acueducto, operario, dev).
 * Supabase Auth ya trae su propio rate-limit; aquí solo verificamos el rol
 * esperado del espacio y mostramos el mismo mensaje genérico ante cualquier
 * fallo.
 */
export async function accederConCorreo(
  correoRaw: string,
  password: string,
  rolEsperado: Rol,
  destino: string,
): Promise<EstadoAcceso> {
  const correo = correoRaw.trim().toLowerCase();
  if (!correo || !password) return { error: MENSAJE_ACCESO_GENERICO };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password,
  });
  if (error) return { error: MENSAJE_ACCESO_GENERICO };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.app_metadata?.rol !== rolEsperado) {
    // Credenciales válidas pero de otro espacio: no se deja entrar aquí.
    await supabase.auth.signOut();
    return { error: MENSAJE_ACCESO_GENERICO };
  }
  redirect(`${destino}?bienvenido=1`);
}

/** Cierra la sesión y vuelve a la página de login del espacio. */
export async function cerrarSesion(destino: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(destino);
}
