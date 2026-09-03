import type { Metadata } from "next";

export const metadata: Metadata = { title: "Acceso colaboradores" };

export default function LayoutAcceso({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-espacio="acceso">{children}</div>;
}
