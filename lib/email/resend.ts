import "server-only";

/**
 * Cliente mínimo de Resend por API REST (sin dependencia). El envío va SIEMPRE
 * en servidor, nunca desde el cliente. Esta función NUNCA lanza: devuelve
 * {ok:false} ante cualquier fallo, para que un correo caído jamás rompa el
 * flujo que lo dispara (p. ej. la confirmación del colaborador).
 */
export interface Correo {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
}

export interface ResultadoEnvio {
  ok: boolean;
  id?: string;
  error?: string;
}

export async function enviarCorreo(correo: Correo): Promise<ResultadoEnvio> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Kidotoy <onboarding@resend.dev>";
  if (!apiKey) {
    // Sin clave configurada: no es un error del flujo, solo no hay correo.
    return { ok: false, error: "RESEND_API_KEY no configurada" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(correo.to) ? correo.to : [correo.to],
        subject: correo.subject,
        html: correo.html,
        text: correo.text,
      }),
    });

    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      return { ok: false, error: `Resend ${res.status}: ${detalle.slice(0, 200)}` };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "error de red" };
  }
}
