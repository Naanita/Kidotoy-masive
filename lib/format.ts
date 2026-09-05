const TZ = "America/Bogota";

/**
 * Normaliza espacios especiales (fina sin salto U+202F, no-break U+00A0) a un
 * espacio normal. `Intl` los inserta (p. ej. "4:39 p. m.") con distinta versión de
 * ICU en Node vs el navegador, lo que provoca un desajuste de hidratación cuando
 * la fecha vive dentro de un componente cliente. Normalizar deja el texto idéntico
 * en servidor y cliente.
 */
function normalizarEspacios(s: string): string {
  return s.replace(/ /g, " ").replace(/ /g, " ");
}

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
  return normalizarEspacios(
    new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: TZ,
    }).format(d),
  );
}

/**
 * Hora relativa corta ("hace 5 min", "hace 2 h", "ayer"). Para listas de
 * actividad. La fecha exacta debe ir en el `title` del elemento (formatearFechaHora).
 */
export function tiempoRelativo(valor: string | null | undefined): string {
  if (!valor) return "";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 45) return "hace un momento";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.round(h / 24);
  if (dias === 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return formatearFecha(valor);
}

/**
 * Fecha y hora: "12 de diciembre de 2026, 3:00 p. m.". Se formatean la fecha y la
 * hora por separado y se unen a mano: formatear ambas en una sola llamada mete un
 * conector de locale ("a las") que difiere entre Node y el navegador y rompía la
 * hidratación. Con el join propio, servidor y cliente coinciden.
 */
export function formatearFechaHora(
  valor: string | Date | null | undefined,
): string {
  if (!valor) return "";
  const d = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(d.getTime())) return "";
  const fecha = normalizarEspacios(
    new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: TZ,
    }).format(d),
  );
  const hora = normalizarEspacios(
    new Intl.DateTimeFormat("es-CO", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TZ,
    }).format(d),
  );
  return `${fecha}, ${hora}`;
}
