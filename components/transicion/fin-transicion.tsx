"use client";

import { useEffect } from "react";
import { useTransicion } from "./proveedor-transicion";

/**
 * Aviso de "la página destino ya montó": retira la capa de la transición.
 *
 * Va DENTRO de la página, no en un `template.tsx`, a propósito. El template se
 * renderiza por fuera del límite de Suspense de `loading.tsx`, así que se
 * dispararía con el esqueleto en pantalla y la transición terminaría
 * descubriendo un esqueleto. Dentro de la página se dispara con el contenido
 * real ya montado.
 *
 * Si no hay transición en curso (recarga, entrada directa), no hace nada.
 */
export function FinTransicion() {
  const { terminar } = useTransicion();

  useEffect(() => {
    terminar();
  }, [terminar]);

  return null;
}
