import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EstadoVentana = "antes" | "abierta" | "cerrada" | "sin_definir";

export interface Ventana {
  estado: EstadoVentana;
  inicio: string | null;
  fin: string | null;
  eventoFecha: string | null;
  eventoLugar: string | null;
  eventoHora: string | null;
}

/**
 * Estado de la ventana de selección de la empresa del colaborador.
 * Las fechas salen de empresas.ventana_inicio / ventana_fin (RLS acota a la
 * empresa del JWT), nunca del código. Es la referencia para la interfaz; la
 * restricción real la aplica confirmar_seleccion() en la base.
 */
export async function obtenerVentana(): Promise<Ventana> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("empresas")
    .select("ventana_inicio, ventana_fin, evento_fecha, evento_lugar, evento_hora")
    .maybeSingle();

  const inicio: string | null = data?.ventana_inicio ?? null;
  const fin: string | null = data?.ventana_fin ?? null;
  const ahora = Date.now();

  let estado: EstadoVentana = "sin_definir";
  if (inicio || fin) {
    if (inicio && ahora < new Date(inicio).getTime()) estado = "antes";
    else if (fin && ahora > new Date(fin).getTime()) estado = "cerrada";
    else estado = "abierta";
  }

  return {
    estado,
    inicio,
    fin,
    eventoFecha: data?.evento_fecha ?? null,
    eventoLugar: data?.evento_lugar ?? null,
    eventoHora: data?.evento_hora ?? null,
  };
}
