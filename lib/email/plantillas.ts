/**
 * Plantillas de correo. HTML seguro para clientes de correo (Gmail/Outlook):
 * tablas, estilos en línea, sin CSS externo ni <style>, sin imágenes pesadas.
 *
 * El correo de confirmación debe seguir sirviendo IMPRESO EN BLANCO Y NEGRO: el
 * colaborador llega con la hoja al evento. Por eso los códigos van en cajas con
 * borde negro y monoespaciado grande, legibles sin depender de ningún color.
 */

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const WRAP_INI = `<!doctype html><html lang="es"><body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111111;">`;
const WRAP_FIN = `</table></td></tr></table></body></html>`;

export interface HijoConfirmado {
  nombre: string;
  producto: string;
  codigo: string;
}

export interface DatosConfirmacion {
  marca: string;
  colaborador: string;
  hijos: HijoConfirmado[];
  eventoFecha: string; // ya formateada
  eventoLugar: string;
}

export function plantillaConfirmacion(d: DatosConfirmacion): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Tu selección de regalos quedó confirmada`;

  const cajasHtml = d.hijos
    .map(
      (h) => `
<tr><td style="padding:8px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #111111;">
    <tr><td style="padding:14px 16px;">
      <div style="font-size:14px;color:#333333;">Para <strong>${esc(h.nombre)}</strong></div>
      <div style="font-size:17px;font-weight:bold;margin:2px 0 10px;">${esc(h.producto)}</div>
      <div style="font-size:12px;color:#333333;text-transform:uppercase;letter-spacing:1px;">Código de entrega</div>
      <div style="font-family:Consolas,Menlo,Courier New,monospace;font-size:30px;font-weight:bold;letter-spacing:4px;color:#000000;">${esc(h.codigo)}</div>
    </td></tr>
  </table>
</td></tr>`,
    )
    .join("");

  const html = `${WRAP_INI}
<tr><td style="padding:0 4px 8px;border-bottom:1px solid #cccccc;">
  <div style="font-size:20px;font-weight:bold;">${esc(d.marca)}</div>
</td></tr>
<tr><td style="padding:18px 4px 6px;">
  <div style="font-size:16px;">Hola ${esc(d.colaborador)},</div>
  <div style="font-size:15px;line-height:1.5;color:#222222;margin-top:6px;">
    Ya elegiste el regalo de ${d.hijos.length === 1 ? "tu hijo" : "todos tus hijos"}.
    Guarda este correo o imprímelo: cada código es lo que presentas el día del evento.
  </div>
</td></tr>
${cajasHtml}
<tr><td style="padding:14px 4px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #999999;">
    <tr><td style="padding:12px 16px;font-size:14px;line-height:1.6;color:#111111;">
      <strong>Entrega de regalos</strong><br/>
      Fecha: ${esc(d.eventoFecha)}<br/>
      Lugar: ${esc(d.eventoLugar)}<br/>
      Presenta el código (o el QR de tu comprobante en la plataforma) en la carpa que corresponde a la edad de cada hijo.
    </td></tr>
  </table>
</td></tr>
<tr><td style="padding:18px 4px;font-size:12px;color:#777777;">
  Este es un correo automático de la plataforma de selección de regalos. No respondas a este mensaje.
</td></tr>
${WRAP_FIN}`;

  const text = [
    `${d.marca}`,
    ``,
    `Hola ${d.colaborador},`,
    `Ya elegiste el regalo de ${d.hijos.length === 1 ? "tu hijo" : "todos tus hijos"}.`,
    `Guarda o imprime este correo: cada código es lo que presentas el día del evento.`,
    ``,
    ...d.hijos.map(
      (h) => `- ${h.nombre}: ${h.producto}\n  CÓDIGO DE ENTREGA: ${h.codigo}`,
    ),
    ``,
    `Entrega de regalos`,
    `Fecha: ${d.eventoFecha}`,
    `Lugar: ${d.eventoLugar}`,
    `Presenta el código en la carpa según la edad de cada hijo.`,
    ``,
    `Correo automático. No respondas a este mensaje.`,
  ].join("\n");

  return { subject, html, text };
}

export interface DatosResumen {
  marca: string;
  fecha: string;
  porcentaje: number;
  confirmados: number;
  pendientes: number;
  confirmadosHoy: number;
  agotadas: number;
  porAgotarse: number;
  colaboradoresPendientes: { nombre: string; area: string | null; pendientes: number }[];
}

export function plantillaResumenDiario(d: DatosResumen): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Resumen del ${d.fecha} · ${d.porcentaje}% de avance`;

  const fila = (etiqueta: string, valor: string | number) => `
<tr>
  <td style="padding:6px 12px;border-bottom:1px solid #eeeeee;font-size:14px;color:#333333;">${esc(etiqueta)}</td>
  <td style="padding:6px 12px;border-bottom:1px solid #eeeeee;font-size:16px;font-weight:bold;text-align:right;">${esc(String(valor))}</td>
</tr>`;

  const pendientesHtml = d.colaboradoresPendientes
    .slice(0, 15)
    .map(
      (c) =>
        `<tr><td style="padding:4px 12px;font-size:13px;border-bottom:1px solid #f2f2f2;">${esc(c.nombre)} <span style="color:#777;">(${esc(c.area ?? "Sin área")})</span></td><td style="padding:4px 12px;font-size:13px;text-align:right;border-bottom:1px solid #f2f2f2;">${c.pendientes}</td></tr>`,
    )
    .join("");

  const html = `${WRAP_INI}
<tr><td style="padding:0 4px 8px;border-bottom:1px solid #cccccc;">
  <div style="font-size:20px;font-weight:bold;">${esc(d.marca)}</div>
  <div style="font-size:13px;color:#666;">Resumen de campaña · ${esc(d.fecha)}</div>
</td></tr>
<tr><td style="padding:14px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dddddd;">
    ${fila("Avance", `${d.porcentaje}%`)}
    ${fila("Confirmados (total)", d.confirmados)}
    ${fila("Confirmados hoy", d.confirmadosHoy)}
    ${fila("Pendientes", d.pendientes)}
    ${fila("Referencias agotadas", d.agotadas)}
    ${fila("Referencias por agotarse", d.porAgotarse)}
  </table>
</td></tr>
<tr><td style="padding:6px 0;font-size:15px;font-weight:bold;">Colaboradores pendientes</td></tr>
<tr><td style="padding:0 0 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dddddd;">
    ${pendientesHtml || `<tr><td style="padding:8px 12px;font-size:13px;color:#666;">Nadie pendiente. Campaña completa.</td></tr>`}
  </table>
</td></tr>
<tr><td style="font-size:12px;color:#777;padding:8px 0;">Correo automático de la plataforma. No responder.</td></tr>
${WRAP_FIN}`;

  const text = [
    `${d.marca} — Resumen ${d.fecha}`,
    `Avance: ${d.porcentaje}%`,
    `Confirmados (total): ${d.confirmados}`,
    `Confirmados hoy: ${d.confirmadosHoy}`,
    `Pendientes: ${d.pendientes}`,
    `Referencias agotadas: ${d.agotadas}`,
    `Referencias por agotarse: ${d.porAgotarse}`,
    ``,
    `Colaboradores pendientes:`,
    ...d.colaboradoresPendientes
      .slice(0, 15)
      .map((c) => `- ${c.nombre} (${c.area ?? "Sin área"}): ${c.pendientes}`),
  ].join("\n");

  return { subject, html, text };
}
