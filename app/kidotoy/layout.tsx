import type { Metadata } from "next";

export const metadata: Metadata = { title: "Administración" };

export default function LayoutKidotoy({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-espacio="kidotoy">{children}</div>;
}
