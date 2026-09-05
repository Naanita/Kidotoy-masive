import { PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarcaKidotoy, MarcaAcueducto } from "@/components/marca/logotipo";
import { FranjaMarca } from "@/components/marca/franja";

type Variante = "kidotoy" | "acueducto" | "operario";

/**
 * Login de los espacios de administración. Misma ESTRUCTURA (tarjeta centrada,
 * marca, título, formulario, remate) con carácter propio por espacio, para que
 * cada uno se sienta del sitio al que da entrada:
 *  - kidotoy: banda azul profundo + logo Kidotoy, título en Fredoka, franja.
 *  - acueducto: sobrio e institucional, logo del Acueducto dominante, Kidotoy
 *    reducido a "Operado por…". Es lo que ve un jefe de RR. HH. de una entidad.
 *  - operario: fondo azul profundo, ícono de entrega y campos/botón grandes,
 *    porque se usa en el celular al aire libre.
 */
export function PantallaLoginAdmin({
  variante,
  titulo,
  descripcion,
  children,
}: {
  variante: Variante;
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}) {
  const esOperario = variante === "operario";

  return (
    <main
      className={cn(
        "flex min-h-dvh items-center justify-center p-4",
        esOperario ? "bg-primary-deep" : "bg-secondary",
      )}
    >
      <div
        className={cn(
          "w-full overflow-hidden rounded-2xl bg-card shadow-xl",
          esOperario ? "max-w-md" : "max-w-sm",
        )}
      >
        {/* Encabezado por variante */}
        {variante === "kidotoy" && (
          <div className="flex justify-center bg-primary-deep px-6 py-5">
            <span className="rounded-md bg-white px-3 py-2">
              <MarcaKidotoy alturaClase="h-7" />
            </span>
          </div>
        )}
        {variante === "acueducto" && (
          <div className="border-t-4 border-primary px-6 pt-8 text-center">
            <MarcaAcueducto className="justify-center" />
          </div>
        )}
        {variante === "operario" && (
          <div className="flex flex-col items-center gap-3 px-6 pt-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-accent text-primary">
              <PackageCheck className="size-9" aria-hidden />
            </span>
            <MarcaKidotoy alturaClase="h-6" />
          </div>
        )}

        <div className={cn("text-center", esOperario ? "px-8 py-8" : "px-6 py-6")}>
          <h1
            className={cn(
              "font-bold text-foreground",
              variante === "kidotoy"
                ? "font-display text-2xl"
                : esOperario
                  ? "font-heading text-3xl"
                  : "font-heading text-2xl",
            )}
          >
            {titulo}
          </h1>
          {descripcion && (
            <p
              className={cn(
                "mt-1 text-muted-foreground",
                esOperario && "text-base",
              )}
            >
              {descripcion}
            </p>
          )}
          <div className="mt-6 text-left">{children}</div>
        </div>

        {/* Remate por variante */}
        {variante === "kidotoy" && <FranjaMarca />}
        {variante === "operario" && <FranjaMarca />}
        {variante === "acueducto" && (
          <p className="flex items-center justify-center gap-1.5 border-t px-6 py-3 text-xs text-muted-foreground">
            Operado por <MarcaKidotoy alturaClase="h-4" />
          </p>
        )}
      </div>
    </main>
  );
}
