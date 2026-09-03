import { AlertTriangle } from "lucide-react";
import { ShellEmpresa } from "@/components/empresa/shell";
import { TarjetaStat } from "@/components/kidotoy/tarjeta-stat";
import { Progress } from "@/components/ui/progress";
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

  const [resumen, pendientes] = await Promise.all([
    obtenerResumen(empresaId),
    obtenerColaboradoresPendientes(empresaId),
  ]);
  const hayAlertas = resumen.agotadas > 0 || resumen.porAgotarse > 0;

  return (
    <ShellEmpresa>
      <div className="space-y-6">
        <section>
          <h1 className="mb-3 text-xl font-semibold">Avance de la campaña</h1>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TarjetaStat etiqueta="Avance" valor={resumen.porcentaje} sufijo="%" tono="exito" />
            <TarjetaStat etiqueta="Confirmados" valor={resumen.confirmados} />
            <TarjetaStat etiqueta="Faltan" valor={resumen.pendientes} tono="advertencia" />
            <TarjetaStat etiqueta="Beneficiarios" valor={resumen.total} />
          </div>
          <Progress value={resumen.porcentaje} className="mt-3" />
        </section>

        {/* Alerta de referencias agotándose: solo conteos, sin stock detallado
            ni nada de negocio (ni costos, ni márgenes, ni precios). */}
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

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Colaboradores pendientes</h2>
            <Badge variant="secondary">{pendientes.length}</Badge>
          </div>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">
                Aún no completan la selección de sus hijos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendientes.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Todos los colaboradores completaron su selección.
                </p>
              ) : (
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
                          <TableCell className="font-medium">{c.nombre}</TableCell>
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
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </ShellEmpresa>
  );
}
