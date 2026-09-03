"use server";

import {
  accederConCorreo,
  cerrarSesion,
  type EstadoAcceso,
} from "@/lib/auth/login";

export async function accionEmpresa(
  _prev: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  return accederConCorreo(
    String(formData.get("correo") ?? ""),
    String(formData.get("password") ?? ""),
    "empresa_cliente",
    "/empresa/panel",
  );
}

export async function salirEmpresa(): Promise<void> {
  await cerrarSesion("/empresa");
}
