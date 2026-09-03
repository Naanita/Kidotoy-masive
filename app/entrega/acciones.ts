"use server";

import { obtenerContexto } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buscarParaEntrega,
  obtenerCarpaOperario,
  type FichaEntrega,
} from "@/lib/entrega/datos";

export interface ResultadoBusqueda {
  fichas: FichaEntrega[];
  error: string | null;
}

export interface ResultadoEntrega {
  ok: boolean;
  yaEntregado: boolean;
  beneficiario: string;
  producto: string;
  carpa: string | null; // carpa asignada de la referencia
  sinCarpa: boolean;
  fueraDeCarpa: boolean;
  entregadoEn: string | null;
  operarioAnterior: string | null;
  error: string | null;
}

export async function buscarEntrega(q: string): Promise<ResultadoBusqueda> {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) return { fichas: [], error: "Sin sesión." };
  const fichas = await buscarParaEntrega(empresaId, q);
  return { fichas, error: null };
}

/**
 * Marca la entrega SIEMPRE vía registrar_entrega(). La carpa de la entrega es la
 * de la referencia; se pasa además la carpa del operario para detectar si
 * entregó fuera de su carpa (no se bloquea, queda registrado).
 */
export async function marcarEntrega(codigo: string): Promise<ResultadoEntrega> {
  const { empresaId, email } = await obtenerContexto();
  const vacio: ResultadoEntrega = {
    ok: false,
    yaEntregado: false,
    beneficiario: "",
    producto: "",
    carpa: null,
    sinCarpa: false,
    fueraDeCarpa: false,
    entregadoEn: null,
    operarioAnterior: null,
    error: null,
  };
  if (!empresaId) return { ...vacio, error: "Sin sesión." };

  const { carpaId } = await obtenerCarpaOperario();
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("registrar_entrega", {
    p_codigo_entrega: codigo,
    p_operario: email ?? "operario",
    p_operario_carpa_id: carpaId,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("CODIGO_NO_EXISTE")) {
      return { ...vacio, error: "El código no existe. Verifica e intenta de nuevo." };
    }
    return { ...vacio, error: "No se pudo registrar la entrega. Inténtalo de nuevo." };
  }

  const r = data as {
    ya_entregado: boolean;
    beneficiario: string;
    producto: string;
    carpa?: string | null;
    sin_carpa?: boolean;
    fuera_de_carpa?: boolean;
    entregado_en?: string;
    operario?: string;
  };

  return {
    ok: true,
    yaEntregado: r.ya_entregado,
    beneficiario: r.beneficiario,
    producto: r.producto,
    carpa: r.carpa ?? null,
    sinCarpa: r.sin_carpa ?? false,
    fueraDeCarpa: r.fuera_de_carpa ?? false,
    entregadoEn: r.entregado_en ?? null,
    operarioAnterior: r.operario ?? null,
    error: null,
  };
}
