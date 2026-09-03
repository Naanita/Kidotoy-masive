import { createPublicClient } from "@/lib/supabase/public";
import type { TemaTokens } from "./serialize";

/**
 * Configuración pública de la empresa activa, leída con la anon key.
 * Es a propósito lo mínimo para pintar el login: marca visible, bandera de
 * banner y tokens de tema (el logo vive dentro de los tokens). Ni id ni slug
 * ni datos de negocio — ver la nota de seguridad en config_publica().
 */
export interface ConfigPublica {
  marca_nombre: string;
  banner_demo: boolean;
  tokens: TemaTokens;
}

/** Valores por defecto cuando la base de datos aún no está disponible. */
const CONFIG_POR_DEFECTO: ConfigPublica = {
  marca_nombre: "Kidotoy",
  banner_demo: true,
  tokens: {},
};

/**
 * Lee tema + marca + bandera de banner de la empresa activa vía RPC
 * `config_publica` (SECURITY DEFINER, granted a anon). Nunca lanza: si la BD
 * no está configurada o falla, devuelve los valores por defecto para que el
 * layout raíz siempre pinte algo coherente.
 */
export async function obtenerConfigPublica(): Promise<ConfigPublica> {
  const slug = process.env.NEXT_PUBLIC_EMPRESA_SLUG ?? "acueducto";
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("config_publica", {
      p_slug: slug,
    });
    if (error || !data) return CONFIG_POR_DEFECTO;
    const cfg = data as Partial<ConfigPublica>;
    return {
      marca_nombre: cfg.marca_nombre?.trim() || "Kidotoy",
      banner_demo: cfg.banner_demo ?? true,
      tokens: (cfg.tokens as TemaTokens) ?? {},
    };
  } catch {
    return CONFIG_POR_DEFECTO;
  }
}
