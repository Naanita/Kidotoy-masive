import Link from "next/link";
import { ArrowRight, Users2, TriangleAlert, Ban } from "lucide-react";
import { ShellKidotoy } from "@/components/kidotoy/shell";
import { GraficaEvolucion } from "@/components/kidotoy/grafica-evolucion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { obtenerContexto } from "@/lib/auth/session";
import {
  obtenerResumen,
  obtenerColaboradoresPendientes,
  obtenerCoberturaGrupos,
  obtenerEvolucion,
} from "@/lib/kidotoy/datos";
import { obtenerReferenciasConCarpa } from "@/lib/kidotoy/carpas";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

function Cifra({
  etiqueta,
  valor,
  tono,
}: {
  etiqueta: string;
  valor: number | string;
  tono?: "peligro" | "advertencia";
}) {
  return (
    <div>
      <p
        className={cn(
          "text-xl font-bold tabular-nums text-foreground",
          tono === "peligro" && "text-destructive",
          tono === "advertencia" && "text-warning",
        )}
      >
        {valor}
      </p>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
    </div>
  );
}

export default async function PaginaResumenKidotoy() {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) {
    return (
      <ShellKidotoy>
        <p className="text-sm text-muted-foreground">Sesión sin empresa.</p>
      </ShellKidotoy>
    );
  }

  const [resumen, pendientes, cobertura, evolucion, referencias] =
    await Promise.all([
      obtenerResumen(empresaId),
      obtenerColaboradoresPendientes(empresaId),
      obtenerCoberturaGrupos(empresaId),
      obtenerEvolucion(empresaId),
      obtenerReferenciasConCarpa(empresaId),
    ]);

  const sinCarpa = referencias.filter((r) => r.activo && !r.carpaId);

  return (
    <ShellKidotoy>
      <h1 className="mb-4 font-heading text-xl font-semibold text-foreground">
        Resumen
      </h1>

      {/* Rompe la jornada y nadie entra a Carpas todos los días: se ve aquí. */}
      {sinCarpa.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <TriangleAlert aria-hidden />
          <AlertTitle>
            {sinCarpa.length}{" "}
            {sinCarpa.length === 1
              ? "referencia sin carpa"
              : "referencias sin carpa"}
          </AlertTitle>
          <AlertDescription>
            Esos juguetes no se podrán entregar el día del evento hasta
            asignarlos.{" "}
            <Link
              href="/kidotoy/carpas"
              className="font-medium text-destructive underline underline-offset-2"
            >
              Asignar en Carpas
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-4 lg:col-span-2">
          {/* ¿Cuánto falta? — el avance domina */}
          <Card>
            <CardContent className="p-4">
              <Kicker>¿Cuánto falta?</Kicker>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold tabular-nums text-foreground">
                  {resumen.porcentaje}%
                </span>
                <span className="pb-1 text-sm text-muted-foreground">
                  de avance
                </span>
              </div>
              <Progress value={resumen.porcentaje} className="mt-2 h-2" />
              <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-3">
                <Cifra etiqueta="Confirmados" valor={resumen.confirmados} />
                <Cifra
                  etiqueta="Pendientes"
                  valor={resumen.pendientes}
                  tono="advertencia"
                />
                <Cifra etiqueta="Beneficiarios" valor={resumen.total} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Evolución */}
            <Card>
              <CardContent className="p-4">
                <Kicker>Evolución de la campaña</Kicker>
                <GraficaEvolucion dias={evolucion.dias} />
              </CardContent>
            </Card>

            {/* ¿Qué se agota? + conclusión de cobertura (una línea, no el mapa) */}
            <Card>
              <CardContent className="space-y-3 p-4">
                <Kicker>¿Qué se agota?</Kicker>
                <div className="grid grid-cols-2 gap-3">
                  <Cifra
                    etiqueta="Referencias agotadas"
                    valor={resumen.agotadas}
                    tono={resumen.agotadas > 0 ? "peligro" : undefined}
                  />
                  <Cifra
                    etiqueta="Por agotarse"
                    valor={resumen.porAgotarse}
                    tono={resumen.porAgotarse > 0 ? "advertencia" : undefined}
                  />
                </div>
                <p className="border-t pt-3 text-sm text-foreground">
                  <span className="text-muted-foreground">Cobertura: </span>
                  {cobertura.criticos > 0 ? (
                    <span className="font-semibold text-destructive">
                      {cobertura.criticos}{" "}
                      {cobertura.criticos === 1 ? "grupo no alcanza" : "grupos no alcanzan"}
                    </span>
                  ) : (
                    <span className="font-medium text-success">
                      todos los grupos alcanzan
                    </span>
                  )}
                  {cobertura.ajustados > 0 && (
                    <>
                      {" · "}
                      <span className="font-medium text-warning">
                        {cobertura.ajustados} ajustados
                      </span>
                    </>
                  )}
                  .
                </p>
                {cobertura.sinReferencias > 0 && (
                  <p className="flex items-start gap-1.5 rounded-md bg-warning/15 p-2 text-xs text-foreground">
                    <Ban className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
                    <span>
                      <span className="font-semibold">
                        {cobertura.sinReferencias} de 28 grupos sin referencias
                        asignadas.
                      </span>{" "}
                      Un niño de esos grupos entraría a un catálogo vacío. El
                      catálogo actual es una muestra; falta surtir el resto antes
                      de producción.
                    </span>
                  </p>
                )}
                <Link
                  href="/kidotoy/inventario"
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Ver rejilla de cobertura
                  <ArrowRight className="ml-1 size-3.5" aria-hidden />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ¿Quiénes no han entrado? */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <Kicker>¿Quiénes no han entrado?</Kicker>
              <Badge variant="secondary" className="shrink-0">
                <Users2 className="mr-1 size-3.5" aria-hidden />
                {pendientes.length}
              </Badge>
            </div>
            {pendientes.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Todos los colaboradores completaron su selección.
              </p>
            ) : (
              <ul className="-mx-1 divide-y">
                {pendientes.slice(0, 14).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-2 px-1 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {c.nombre}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.area ?? "Sin área"} · CC {c.cedula}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-warning">
                      {c.pendientes}/{c.total}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {pendientes.length > 14 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Mostrando 14 de {pendientes.length}. Exporta desde Selecciones
                para la lista completa.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ShellKidotoy>
  );
}
