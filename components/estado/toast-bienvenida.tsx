"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notificar } from "@/lib/notificar";

/**
 * Muestra el toast "Sesión iniciada" cuando se llega tras un login (la acción de
 * login redirige con ?bienvenido=1). Luego limpia el parámetro de la URL sin
 * recargar. Va montado una vez en el layout raíz, así cubre los cinco espacios.
 */
export function ToastBienvenida() {
  const params = useSearchParams();
  const router = useRouter();
  const disparado = useRef(false);

  useEffect(() => {
    if (params.get("bienvenido") === "1" && !disparado.current) {
      disparado.current = true;
      notificar.exito("Sesión iniciada", "Bienvenido de nuevo.");
      const url = new URL(window.location.href);
      url.searchParams.delete("bienvenido");
      router.replace(url.pathname + (url.search ? url.search : ""), {
        scroll: false,
      });
    }
  }, [params, router]);

  return null;
}
