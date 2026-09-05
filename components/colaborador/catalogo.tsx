"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { TarjetaProducto } from "./tarjeta-producto";
import type { Producto } from "@/lib/colaborador/datos";

/**
 * Catálogo con disponibilidad en vivo. Realtime es SOLO cosmético: mantiene el
 * stock a la vista sin recargar, pero la verdad la dicta confirmar_seleccion().
 * Aunque Realtime falle, el flujo sigue siendo correcto.
 */
export function Catalogo({
  productosIniciales,
  edad,
  genero,
  beneficiarioId,
  seleccionAbierta = true,
}: {
  productosIniciales: Producto[];
  edad: number;
  genero: string;
  beneficiarioId: string;
  seleccionAbierta?: boolean;
}) {
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let canal: ReturnType<typeof supabase.channel> | null = null;
    let cancelado = false;

    const manejarCambio = (payload: { new: Producto & { genero: string } }) => {
      const nuevo = payload.new;
      if (nuevo.genero !== genero) return; // el filtro realtime es de una columna
      setProductos((prev) =>
        prev.map((p) =>
          p.id === nuevo.id
            ? { ...p, stock_disponible: nuevo.stock_disponible }
            : p,
        ),
      );
    };

    // Realtime respeta RLS: el socket necesita el JWT del colaborador, o Postgres
    // no entrega los cambios (prod_lectura exige empresa autenticada). Sin esto,
    // la suscripción corre como anónima y no llega nada.
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelado) return;
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      canal = supabase
        .channel(`catalogo-${edad}-${genero}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "productos", filter: `edad=eq.${edad}` },
          manejarCambio,
        )
        .subscribe();
    })();

    return () => {
      cancelado = true;
      if (canal) supabase.removeChannel(canal);
    };
  }, [edad, genero]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
      {productos.map((p) => (
        <TarjetaProducto
          key={p.id}
          producto={p}
          beneficiarioId={beneficiarioId}
          seleccionAbierta={seleccionAbierta}
        />
      ))}
    </div>
  );
}
