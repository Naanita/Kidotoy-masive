import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Vista previa con componentes REALES del producto (no cuadros de muestra), para
 * ver si un cambio de tema funciona de verdad. Se pinta dentro de un contenedor
 * con las variables del tema en edición (scope local: no afecta el resto del panel).
 */
export function PreviewTema({
  style,
  dark,
  marca,
  logoUrl,
}: {
  style: React.CSSProperties;
  dark: boolean;
  marca: string;
  logoUrl: string | null;
}) {
  return (
    <div
      style={style}
      className={`${dark ? "dark " : ""}rounded-lg border bg-background p-4 text-foreground`}
    >
      <div className="space-y-4">
        {/* Encabezado con logo o marca */}
        <header className="flex items-center justify-between border-b pb-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={marca} className="h-7 w-auto" />
          ) : (
            <span className="font-heading text-lg font-semibold">{marca}</span>
          )}
          <Badge variant="secondary">Vista previa</Badge>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Tarjeta de juguete con disponibilidad */}
          <Card>
            <CardContent className="p-3">
              <div className="aspect-square w-full rounded-md bg-muted" />
              <div className="mt-3 flex items-start justify-between gap-2">
                <h3 className="font-medium leading-tight">Set de bloques 60 piezas</h3>
                <Badge className="shrink-0 bg-warning text-warning-foreground hover:bg-warning">
                  Últimas 3
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Piezas grandes, seguras.
              </p>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Button className="h-11 w-full">Elegir este</Button>
            </CardFooter>
          </Card>

          {/* Tarjeta de beneficiario confirmado */}
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-semibold">Emiliano</span>
                <Badge className="bg-success text-success-foreground hover:bg-success">
                  <CheckCircle2 className="mr-1 size-3.5" aria-hidden />
                  Confirmado
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">7 años · Niño</p>
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs text-muted-foreground">Código de entrega</p>
                <p className="font-mono text-lg font-semibold tracking-wider">
                  7F3A9C2B1D
                </p>
              </div>
              <Button variant="outline" className="h-10 w-full">
                Ver comprobante
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de error */}
        <Alert variant="destructive">
          <AlertTriangle className="size-4" aria-hidden />
          <AlertTitle>Se agotó mientras elegías</AlertTitle>
          <AlertDescription>
            Este juguete se agotó. Por favor selecciona otro.
          </AlertDescription>
        </Alert>

        {/* Fila de tabla del panel */}
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beneficiario</TableHead>
                <TableHead>Juguete</TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Andrés Salcedo</TableCell>
                <TableCell>Kit de robótica</TableCell>
                <TableCell className="text-right">
                  <Badge className="bg-success text-success-foreground hover:bg-success">
                    Entregado
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Manuela Ruiz</TableCell>
                <TableCell>Set de arte</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">Pendiente</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <Button className="w-full">Botón principal</Button>
      </div>
    </div>
  );
}
