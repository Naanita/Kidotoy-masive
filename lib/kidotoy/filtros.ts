import type { FilaSeleccion } from "./datos";
import type { FilaEntregaGestion } from "./entregas";

export interface FiltrosSeleccion {
  edad?: string | null;
  genero?: string | null;
  area?: string | null;
  estado?: string | null;
  q?: string | null;
}

/**
 * Filtro compartido entre la tabla del panel (cliente) y la exportación CSV
 * (servidor), para que ambos apliquen exactamente los mismos criterios.
 */
export function filtrarSelecciones(
  filas: FilaSeleccion[],
  f: FiltrosSeleccion,
): FilaSeleccion[] {
  const t = (f.q ?? "").trim().toLowerCase();
  return filas.filter((fila) => {
    if (f.edad && String(fila.edad) !== f.edad) return false;
    if (f.genero && fila.genero !== f.genero) return false;
    if (f.area && (fila.area ?? "") !== f.area) return false;
    if (f.estado && fila.estado !== f.estado) return false;
    if (t) {
      const blob =
        `${fila.beneficiario} ${fila.colaborador} ${fila.cedula} ${fila.producto ?? ""} ${fila.codigoEntrega ?? ""}`.toLowerCase();
      if (!blob.includes(t)) return false;
    }
    return true;
  });
}

export interface FiltrosEntrega {
  carpaId?: string | null; // id de carpa, o "__sin__" para sin carpa
  estado?: string | null; // "entregado" | "pendiente"
  q?: string | null;
}

/** Filtro compartido entre la gestión de entregas (cliente) y su CSV (servidor). */
export function filtrarEntregas(
  filas: FilaEntregaGestion[],
  f: FiltrosEntrega,
): FilaEntregaGestion[] {
  const t = (f.q ?? "").trim().toLowerCase();
  return filas.filter((fila) => {
    if (f.carpaId && (fila.carpaId ?? "__sin__") !== f.carpaId) return false;
    if (f.estado === "entregado" && !fila.entregado) return false;
    if (f.estado === "pendiente" && fila.entregado) return false;
    if (t) {
      const blob =
        `${fila.beneficiario} ${fila.colaborador} ${fila.cedula} ${fila.producto} ${fila.codigo} ${fila.operario ?? ""}`.toLowerCase();
      if (!blob.includes(t)) return false;
    }
    return true;
  });
}
