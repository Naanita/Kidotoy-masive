import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrega" };

export default function LayoutEntrega({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-espacio="entrega">{children}</div>;
}
