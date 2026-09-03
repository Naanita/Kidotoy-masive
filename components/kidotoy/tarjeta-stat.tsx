import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Cifra grande con etiqueta, para el resumen del panel. */
export function TarjetaStat({
  etiqueta,
  valor,
  sufijo,
  tono = "neutro",
}: {
  etiqueta: string;
  valor: string | number;
  sufijo?: string;
  tono?: "neutro" | "exito" | "advertencia" | "peligro";
}) {
  const color =
    tono === "exito"
      ? "text-success"
      : tono === "advertencia"
        ? "text-warning"
        : tono === "peligro"
          ? "text-destructive"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{etiqueta}</p>
        <p className={cn("mt-1 text-3xl font-bold tabular-nums", color)}>
          {valor}
          {sufijo && (
            <span className="ml-1 text-base font-normal text-muted-foreground">
              {sufijo}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
