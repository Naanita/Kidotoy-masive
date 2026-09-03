import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { enviarCorreo } from "./resend";
import { plantillaConfirmacion, type HijoConfirmado } from "./plantillas";
import { formatearFecha } from "@/lib/format";
import { obtenerConfigPublica } from "@/lib/theme/config";

function uno<T>(rel: unknown): T | null {
  if (Array.isArray(rel)) return (rel[0] as T) ?? null;
  return (rel as T) ?? null;
}

/**
 * Envía el correo de confirmación SOLO cuando el colaborador ya eligió el
 * regalo de TODOS sus hijos y tiene correo registrado. Se llama después de una
 * confirmación exitosa.
 *
 * Best-effort y aislado: cualquier fallo (sin correo, Resend caído, datos
 * incompletos) se traga en silencio. La selección ya quedó guardada y el
 * comprobante está en pantalla; el correo nunca puede romper ese flujo.
 */
export async function notificarSiColaboradorCompleto(
  beneficiarioId: string,
): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();

    // Colaborador dueño de este beneficiario.
    const { data: benef } = await supabase
      .from("beneficiarios")
      .select("colaborador_id")
      .eq("id", beneficiarioId)
      .maybeSingle();
    const colaboradorId = (benef as { colaborador_id?: string } | null)?.colaborador_id;
    if (!colaboradorId) return;

    const { data: colab } = await supabase
      .from("colaboradores")
      .select("nombre, correo")
      .eq("id", colaboradorId)
      .maybeSingle();
    const correo = (colab as { correo?: string } | null)?.correo;
    if (!correo) return; // sin correo registrado: nada que enviar

    // Todos sus hijos con su selección (si la tienen).
    const { data: hijosData } = await supabase
      .from("beneficiarios")
      .select("nombre, edad, selecciones(codigo_entrega, productos(nombre))")
      .eq("colaborador_id", colaboradorId)
      .order("edad", { ascending: true });

    const hijos = (hijosData as unknown[]) ?? [];
    if (hijos.length === 0) return;

    const confirmados: HijoConfirmado[] = [];
    for (const row of hijos) {
      const h = row as { nombre: string; selecciones: unknown };
      const sel = uno<{ codigo_entrega: string; productos: unknown }>(h.selecciones);
      if (!sel) return; // hay un hijo sin elegir → aún no está completo
      const prod = uno<{ nombre: string }>(sel.productos);
      confirmados.push({
        nombre: h.nombre,
        producto: prod?.nombre ?? "",
        codigo: sel.codigo_entrega,
      });
    }

    // Datos del evento.
    const { data: empresa } = await supabase
      .from("empresas")
      .select("evento_fecha, evento_lugar")
      .maybeSingle();
    const ev = empresa as { evento_fecha?: string; evento_lugar?: string } | null;
    const config = await obtenerConfigPublica();

    const { subject, html, text } = plantillaConfirmacion({
      marca: config.marca_nombre,
      colaborador: (colab as { nombre: string }).nombre,
      hijos: confirmados,
      eventoFecha: ev?.evento_fecha ? formatearFecha(ev.evento_fecha) : "Por confirmar",
      eventoLugar: ev?.evento_lugar ?? "Por confirmar",
    });

    await enviarCorreo({ to: correo, subject, html, text });
  } catch {
    // Silencio deliberado: el correo jamás rompe la confirmación.
  }
}
