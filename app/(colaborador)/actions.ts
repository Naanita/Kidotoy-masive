"use server";

import {
  accederColaborador,
  cerrarSesion,
  type EstadoAcceso,
} from "@/lib/auth/login";

export async function accionAcceso(
  _prev: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  return accederColaborador(
    String(formData.get("cedula") ?? ""),
    String(formData.get("codigo_sap") ?? ""),
  );
}

export async function salirAcceso(): Promise<void> {
  await cerrarSesion("/");
}
