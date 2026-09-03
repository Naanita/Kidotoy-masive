"use server";

import {
  accederConCorreo,
  cerrarSesion,
  type EstadoAcceso,
} from "@/lib/auth/login";

export async function accionKidotoy(
  _prev: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  return accederConCorreo(
    String(formData.get("correo") ?? ""),
    String(formData.get("password") ?? ""),
    "admin_kidotoy",
    "/kidotoy/panel",
  );
}

export async function salirKidotoy(): Promise<void> {
  await cerrarSesion("/kidotoy");
}
