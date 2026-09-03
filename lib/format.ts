const TZ = "America/Bogota";

/** Fecha larga en español de Colombia: "12 de diciembre de 2026". */
export function formatearFecha(valor: string | Date | null | undefined): string {
  if (!valor) return "";
  const d = typeof valor === "string" ? new Date(valor) : valor;
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
