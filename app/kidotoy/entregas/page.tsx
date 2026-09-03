import { Tent } from "lucide-react";
import { ShellKidotoy } from "@/components/kidotoy/shell";
import { TarjetaStat } from "@/components/kidotoy/tarjeta-stat";
import { GestionEntregas } from "@/components/kidotoy/gestion-entregas";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatearFechaHora } from "@/lib/format";
import { obtenerContexto } from "@/lib/auth/session";
import {
  obtenerFilasEntregaGestion,
  resumirEntregas,
  ultimasEntregas,
} from "@/lib/kidotoy/entregas";

export const dynamic = "force-dynamic";

export default async function PaginaEntregasKidotoy() {
  const { empresaId, email } = await obtenerContexto();
  if (!empresaId) {
    return (
      <ShellKidotoy>
        <p className="text-sm text-muted-foreground">Sesión sin empresa.</p>
      </ShellKidotoy>
    );
  }

  const filas = await obtenerFilasEntregaGestion(empresaId);
  const resumen = resumirEntregas(filas);
  const ultimas = ultimasEntregas(filas);
  const carpas = resumen.porCarpa
    .filter((c) => c.carpaId)
    .map((c) => ({ id: c.carpaId as string, nombre: c.carpaNombre }));

  return (
    <ShellKidotoy>
      <div className="space-y-8">
        <section>
          <h1 className="mb-3 text-xl font-semibold">Jornada de entrega</h1>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TarjetaStat etiqueta="Entregadas" valor={resumen.entregadas} tono="exito" />
            <TarjetaStat etiqueta="Pendientes de entrega" valor={resumen.pendientes} tono="advertencia" />
            <TarjetaStat etiqueta="Avance de entrega" valor={resumen.porcentaje} sufijo="%" />
            <TarjetaStat
              etiqueta="Fuera de carpa"
              valor={resumen.fueraDeCarpa}
              tono={resumen.fueraDeCarpa > 0 ? "advertencia" : "neutro"}
            />
          </div>
          <Progress value={resumen.porcentaje} className="mt-3" />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Avance por carpa</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {resumen.porCarpa.map((c) => {
              const pct = c.confirmadas > 0 ? Math.round((100 * c.entregadas) / c.confirmadas) : 0;
              return (
                <Card key={c.carpaId ?? "sin"}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-semibold">
                        <Tent className="size-4" aria-hidden />
                        {c.carpaNombre}
                      </span>
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {c.entregadas}/{c.confirmadas}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-3" />
                    <p className="mt-2 text-sm">
                      <span className="font-semibold tabular-nums text-warning">
                        {c.pendientes}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        pendientes {c.pendientes > 0 ? "· mandar refuerzo si se congestiona" : ""}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Últimas entregas</h2>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Registro reciente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {ultimas.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Aún no hay entregas registradas.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Beneficiario</TableHead>
                        <TableHead className="w-16">Carpa</TableHead>
                        <TableHead>Juguete</TableHead>
                        <TableHead>Operario</TableHead>
                        <TableHead>Hora</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ultimas.map((f) => (
                        <TableRow key={f.seleccionId}>
                          <TableCell className="font-medium">{f.beneficiario}</TableCell>
                          <TableCell>
                            {f.carpaNombre ?? "Sin carpa"}
                            {f.fueraDeCarpa && (
                              <span className="ml-1 text-xs text-warning">(fuera)</span>
                            )}
                          </TableCell>
                          <TableCell>{f.producto}</TableCell>
                          <TableCell className="text-muted-foreground">{f.operario ?? "—"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatearFechaHora(f.entregadoEn)}
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

        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Buscar y gestionar entregas
          </h2>
          <GestionEntregas filas={filas} carpas={carpas} adminEmail={email ?? "—"} />
        </section>
      </div>
    </ShellKidotoy>
  );
}
