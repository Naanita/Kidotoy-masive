import { PackageCheck, Inbox, Tent } from "lucide-react";
import { ShellKidotoy } from "@/components/kidotoy/shell";
import { RejillaCarpas } from "@/components/kidotoy/rejilla-carpas";
import { GestionEntregas } from "@/components/kidotoy/gestion-entregas";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { EstadoVacio } from "@/components/estado/estado-vacio";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatearFechaHora, tiempoRelativo } from "@/lib/format";
import { obtenerContexto } from "@/lib/auth/session";
import {
  obtenerFilasEntregaGestion,
  resumirEntregas,
  ultimasEntregas,
} from "@/lib/kidotoy/entregas";

export const dynamic = "force-dynamic";

function Cifra({
  etiqueta,
  valor,
  tono,
}: {
  etiqueta: string;
  valor: number | string;
  tono?: "exito" | "advertencia";
}) {
  return (
    <div>
      <p
        className={
          "text-xl font-bold tabular-nums text-foreground" +
          (tono === "exito" ? " text-success" : tono === "advertencia" ? " text-warning" : "")
        }
      >
        {valor}
      </p>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
    </div>
  );
}

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
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Entregas
      </h1>

      <div className="space-y-6">
        {/* Métricas de la jornada — el avance domina */}
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Jornada de entrega
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {resumen.porcentaje}%
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                entregado
              </span>
            </div>
            <Progress value={resumen.porcentaje} className="mt-2 h-2" />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
              <Cifra etiqueta="Entregadas" valor={resumen.entregadas} tono="exito" />
              <Cifra
                etiqueta="Por entregar"
                valor={resumen.pendientes}
                tono="advertencia"
              />
              <Cifra
                etiqueta="Fuera de carpa"
                valor={resumen.fueraDeCarpa}
                tono={resumen.fueraDeCarpa > 0 ? "advertencia" : undefined}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mapa de la jornada */}
        <RejillaCarpas resumen={resumen} />

        {/* Últimas entregas */}
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
            Últimas entregas
          </h2>
          {ultimas.length === 0 ? (
            <EstadoVacio
              icon={Inbox}
              titulo="Aún no hay entregas"
              descripcion="Cuando los operarios marquen entregas en la jornada, el registro reciente aparecerá aquí."
            />
          ) : (
            <div className="overflow-x-auto rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beneficiario</TableHead>
                    <TableHead>Juguete</TableHead>
                    <TableHead>Carpa</TableHead>
                    <TableHead>Operario</TableHead>
                    <TableHead className="text-right">Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ultimas.map((f) => (
                    <TableRow key={f.seleccionId}>
                      <TableCell className="font-medium">
                        {f.beneficiario}
                      </TableCell>
                      <TableCell>{f.producto}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          <Tent
                            className="size-3.5 text-muted-foreground"
                            aria-hidden
                          />
                          {f.carpaNombre ?? "Sin carpa"}
                          {f.fueraDeCarpa && (
                            <span className="rounded-full bg-kido-morado/15 px-1.5 py-0.5 text-xs font-medium text-kido-morado">
                              fuera de carpa
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {f.operario ?? "—"}
                      </TableCell>
                      <TableCell
                        className="text-right text-muted-foreground"
                        title={formatearFechaHora(f.entregadoEn)}
                      >
                        {tiempoRelativo(f.entregadoEn)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        {/* Buscar y revertir */}
        <section>
          <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
            Buscar y revertir una entrega
          </h2>
          <GestionEntregas
            filas={filas}
            carpas={carpas}
            adminEmail={email ?? "—"}
          />
        </section>
      </div>
    </ShellKidotoy>
  );
}
