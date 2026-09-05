import { cn } from "@/lib/utils";

/**
 * Forma geométrica gris muy tenue anclada abajo a la derecha, presente en las
 * dos pantallas de la propuesta del cliente. Es solo atmósfera: nunca lleva
 * contenido ni recibe eventos, y su color sale del token `--gris-decorativo`
 * (#E6ECEC, medido del mockup) para que no compita con nada.
 */
export function FormaDecorativa({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -bottom-40 -right-36 -z-0 hidden size-[22rem] rotate-[28deg] rounded-[5rem] bg-gris-decorativo lg:block",
        className,
      )}
    />
  );
}
