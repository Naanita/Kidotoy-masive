import type { Metadata } from "next";
import { ProveedorTransicion } from "@/components/transicion/proveedor-transicion";

export const metadata: Metadata = { title: "Acceso colaboradores" };

/**
 * Layout del espacio del colaborador. Persiste entre `/` (login) y `/inicio`,
 * que es justo lo que necesita la transición de bienvenida: la capa animada
 * tiene que sobrevivir a la navegación entre esas dos rutas.
 */
export default function LayoutColaborador({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-espacio="colaborador">
      <ProveedorTransicion>{children}</ProveedorTransicion>
    </div>
  );
}
