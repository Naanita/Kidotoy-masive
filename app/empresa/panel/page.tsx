import { AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { ShellEmpresa } from "@/components/empresa/shell";
import { GraficaEvolucion } from "@/components/kidotoy/grafica-evolucion";
import { EstadoVacio } from "@/components/estado/estado-vacio";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { obtenerContexto } from "@/lib/auth/session";
import {
  obtenerResumen,
  obtenerEvolucion,
  obtenerColaboradoresPendientes,
} from "@/lib/kidotoy/datos";

export default async function PaginaAvanceEmpresa() {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) {
    return (
      <ShellEmpresa>
        <p className="text-sm text-muted-foreground">Sesión sin empresa.</p>
      </ShellEmpresa>
    );
  }

  const [resumen, evolucion, pendientes] = await Promise.all([
    obtenerResumen(empresaId),
    obtenerEvolucion(empresaId),
    obtenerColaboradoresPendientes(empresaId),
  ]);
  const hayAlertas = resumen.agotadas > 0 || resumen.porAgotarse > 0;

  return (
    <ShellEmpresa>
      <div className="space-y-8">
        {/* Resumen ejecutivo: la lectura de un vistazo para RR. HH. */}
        <section>
          <header className="mb-4">
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              Avance de la campaña
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Estado de la selección de regalos de fin de año. Se actualiza a
              medida que los colaboradores confirman.
            </p>
          </header>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Gráfica: evolución acumulada del % confirmado */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">
                  Evolución de confirmaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GraficaEvolucion dias={evolucion.dias} />
              </CardContent>
            </Card>

            {/* Métricas: cifras sobrias, sin nada de negocio */}
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:content-start">
              <Metrica etiqueta="Confirmados" valor={resumen.confirmados} />
              <Metrica
                etiqueta="Faltan"
                valor={resumen.pendientes}
                acento="advertencia"
              />
              <Metrica etiqueta="Beneficiarios" valor={resumen.total} />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm font-medium text-foreground">
                Cobertura de la campaña
              </span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {resumen.porcentaje}%
              </span>
            </div>
            <Progress value={resumen.porcentaje} />
          </div>
        </section>

        {/* Alerta de disponibilidad: solo conteos, sin stock detallado ni nada
            de negocio (ni costos, ni márgenes, ni precios). */}
        {hayAlertas && (
          <Alert>
            <AlertTriangle className="size-4" aria-hidden />
            <AlertTitle>Referencias con disponibilidad baja</AlertTitle>
            <AlertDescription>
              {resumen.agotadas > 0 && (
                <span>{resumen.agotadas} agotada(s). </span>
              )}
              {resumen.porAgotarse > 0 && (
                <span>{resumen.porAgotarse} por agotarse. </span>
              )}
              Algunos grupos podrían quedarse sin opciones antes del cierre.
            </AlertDescription>
          </Alert>
        )}

        {/* Colaboradores pendientes, con exportación y estado vacío */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Colaboradores pendientes
              </h2>
              {pendientes.length > 0 && (
                <Badge variant="secondary" className="tabular-nums">
                  {pendientes.length}
                </Badge>
              )}
            </div>
            {pendientes.length > 0 && (
              <Button asChild variant="outline" size="sm">
                <a href="/empresa/pendientes/export">
                  <Download className="mr-2 size-4" aria-hidden />
                  Exportar CSV
                </a>
              </Button>
            )}
          </div>

          {pendientes.length === 0 ? (
            <EstadoVacio
              icon={CheckCircle2}
              titulo="No queda nadie pendiente"
              descripcion="Todos los colaboradores completaron la selección de sus hijos."
            />
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Área</TableHead>
                        <TableHead className="text-right">Le faltan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendientes.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.nombre}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {c.area ?? "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {c.pendientes} de {c.total}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </ShellEmpresa>
  );
}

/** Cifra sobria del resumen ejecutivo. Neutra por defecto; "advertencia" solo
 *  para lo que exige atención (los que faltan). */
function Metrica({
  etiqueta,
  valor,
  acento,
}: {
  etiqueta: string;
  valor: number;
  acento?: "advertencia";
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{etiqueta}</p>
      <p
        className={
          "mt-0.5 text-2xl font-semibold tabular-nums " +
          (acento === "advertencia" ? "text-warning" : "text-foreground")
        }
      >
        {valor}
      </p>
    </div>
  );
}
