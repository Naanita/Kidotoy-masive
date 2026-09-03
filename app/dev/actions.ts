"use server";

import {
  accederConCorreo,
  cerrarSesion,
  type EstadoAcceso,
} from "@/lib/auth/login";

export async function accionDev(
  _prev: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  return accederConCorreo(
    String(formData.get("correo") ?? ""),
    String(formData.get("password") ?? ""),
    "admin_dev",
    "/dev/panel",
  );
}

export async function salirDev(): Promise<void> {
  await cerrarSesion("/dev");
}
