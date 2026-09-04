const TZ = "America/Bogota";

/**
 * Código de entrega en grupos para leer y dictar por teléfono. SOLO presentación:
 * el código real (10 hex) y la búsqueda no cambian. "0B636E4D65" → "0B63 6E4D 65".
 */
export function formatearCodigo(codigo: string): string {
  return codigo
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

/** Fecha larga en español de Colombia: "12 de diciembre de 2026". */
export function formatearFecha(valor: string | Date | null | undefined): string {
  if (!valor) return "";
  // Una fecha "solo día" (YYYY-MM-DD) se parsea como UTC; en zona -5 rodaría al
  // día anterior. Anclarla al mediodía evita ese corrimiento.
  const s =
    typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)
      ? `${valor}T12:00:00`
      : valor;
  const d = typeof s === "string" ? new Date(s) : s;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

/** Fecha y hora: "12 de diciembre de 2026, 3:00 p. m." */
export function formatearFechaHora(
  valor: string | Date | null | undefined,
): string {
  if (!valor) return "";
  const d = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  }).format(d);
}
