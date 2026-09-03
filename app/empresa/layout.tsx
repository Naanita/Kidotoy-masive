import type { Metadata } from "next";

export const metadata: Metadata = { title: "Portal del Acueducto" };

export default function LayoutEmpresa({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-espacio="empresa">{children}</div>;
}
