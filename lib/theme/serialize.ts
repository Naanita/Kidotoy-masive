import { TOKEN_SPECS, validateToken } from "./tokens";

export type TemaTokens = Record<string, unknown>;

/**
 * Convierte los tokens de la empresa en el cuerpo de un bloque `:root { ... }`,
 * descartando en silencio todo lo que no esté en la lista blanca o no valide.
 * Devuelve "" si no hay ningún token válido (entonces no se inyecta nada y
 * mandan los valores por defecto de globals.css).
 */
export function serializarTokens(tokens: TemaTokens | null | undefined): string {
  if (!tokens || typeof tokens !== "object") return "";
  const parts: string[] = [];
  for (const key of Object.keys(TOKEN_SPECS)) {
    if (!(key in tokens)) continue;
    const valid = validateToken(key, (tokens as Record<string, unknown>)[key]);
    if (valid !== null) parts.push(`--${key}:${valid}`);
  }
  return parts.join(";");
}

/**
 * Construye el string completo `:root{...}` listo para un <style>, o null si
 * no hay nada válido que inyectar. El contenido ya está saneado por
 * validateToken, así que es seguro para dangerouslySetInnerHTML.
 */
export function construirEstiloTema(
  tokens: TemaTokens | null | undefined,
): string | null {
  const body = serializarTokens(tokens);
  return body ? `:root{${body}}` : null;
}
