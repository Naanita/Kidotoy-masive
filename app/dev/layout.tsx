import type { Metadata } from "next";

// Ruta oculta: no enlazada desde ninguna parte de la interfaz. Se llega solo
// escribiendo la URL. noindex para no filtrarla a buscadores.
export const metadata: Metadata = {
  title: "dev",
  robots: { index: false, follow: false },
};

export default function LayoutDev({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-espacio="dev">{children}</div>;
}
