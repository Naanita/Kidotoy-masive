import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

// Nunca cachear: cada llamada debe golpear Supabase de verdad.
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/keepalive
 *
 * Mantiene despierto el proyecto de Supabase (plan gratuito: se pausa tras 7
 * días sin actividad). Llama a la función `ping()` por RPC con la anon key.
 * Una llamada a RPC cuenta como actividad igual que una consulta a tabla, sin
 * exponer la service role key en una ruta pública.
 *
 * Conéctale un cron externo cada 24 h (ver README).
 */
export async function GET() {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("ping");
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, ping: data });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
