"use server";

import {
  accederConCorreo,
  cerrarSesion,
  type EstadoAcceso,
} from "@/lib/auth/login";

export async function accionEntrega(
  _prev: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  return accederConCorreo(
    String(formData.get("correo") ?? ""),
    String(formData.get("password") ?? ""),
    "operario_entrega",
    "/entrega/panel",
  );
}

export async function salirEntrega(): Promise<void> {
  await cerrarSesion("/entrega");
}
