/**
 * Generación de CSV para abrir en Excel en Colombia.
 *
 * Tres cosas no negociables o el archivo "se ve roto" para el cliente:
 *  - Separador de PUNTO Y COMA (Excel-es usa la coma como separador decimal;
 *    con coma, todo cae en una sola columna).
 *  - UTF-8 con BOM (sin BOM, Excel rompe los acentos).
 *  - Fechas DD/MM/AAAA.
 */

const TZ = "America/Bogota";

export type CeldaCsv = string | number | null | undefined;

function escapar(valor: CeldaCsv): string {
  const s = valor === null || valor === undefined ? "" : String(valor);
  // Comillas si hay separador, comillas o saltos de línea.
  if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Arma el contenido CSV completo (con BOM y CRLF). */
export function construirCsv(
  encabezados: string[],
  filas: CeldaCsv[][],
): string {
  const lineas = [encabezados, ...filas].map((fila) =>
    fila.map(escapar).join(";"),
  );
  return "﻿" + lineas.join("\r\n");
}

/** Respuesta HTTP de descarga para un CSV. */
export function respuestaCsv(nombreArchivo: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Fecha DD/MM/AAAA en horario de Colombia, para celdas de CSV. */
export function fechaCsv(valor: string | Date | null | undefined): string {
  if (!valor) return "";
  const d = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(d.getTime())) return "";
  const partes = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TZ,
  }).formatToParts(d);
  const g = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  return `${g("day")}/${g("month")}/${g("year")}`;
}
