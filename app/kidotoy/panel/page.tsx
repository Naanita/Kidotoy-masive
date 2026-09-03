import Link from "next/link";
import { AlertTriangle, PackageX, Users2, ArrowRight } from "lucide-react";
import { ShellKidotoy } from "@/components/kidotoy/shell";
import { TarjetaStat } from "@/components/kidotoy/tarjeta-stat";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { obtenerContexto } from "@/lib/auth/session";
import {
  obtenerResumen,
  obtenerColaboradoresPendientes,
} from "@/lib/kidotoy/datos";

export default async function PaginaResumenKidotoy() {
  const { empresaId } = await obtenerContexto();
  if (!empresaId) {
    return (
      <ShellKidotoy>
        <p className="text-sm text-muted-foreground">Sesión sin empresa.</p>
      </ShellKidotoy>
    );
  }

  const [resumen, pendientes] = await Promise.all([
    obtenerResumen(empresaId),
    obtenerColaboradoresPendientes(empresaId),
  ]);

  return (
    <ShellKidotoy>
      <div className="space-y-6">
        {/* Pregunta 1: ¿cuánto falta? */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            ¿Cuánto falta?
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <TarjetaStat etiqueta="Avance" valor={resumen.porcentaje} sufijo="%" tono="exito" />
            <TarjetaStat etiqueta="Confirmados" valor={resumen.confirmados} />
            <TarjetaStat etiqueta="Pendientes" valor={resumen.pendientes} tono="advertencia" />
            <TarjetaStat etiqueta="Beneficiarios" valor={resumen.total} />
          </div>
          <Progress value={resumen.porcentaje} className="mt-3" />
        </section>

        {/* Pregunta 2: ¿qué se está agotando? */}
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            ¿Qué se está agotando?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <TarjetaStat
              etiqueta="Referencias agotadas"
              valor={resumen.agotadas}
              tono={resumen.agotadas > 0 ? "peligro" : "neutro"}
            />
            <TarjetaStat
              etiqueta="Por agotarse (< 20%)"
              valor={resumen.porAgotarse}
              tono={resumen.porAgotarse > 0 ? "advertencia" : "neutro"}
            />
          </div>
          <Button asChild variant="link" className="mt-1 h-auto p-0">
            <Link href="/kidotoy/inventario">
              Ver inventario por edad y género
              <ArrowRight className="ml-1 size-3.5" aria-hidden />
            </Link>
          </Button>
        </section>

        {/* Pregunta 3: ¿quiénes no han entrado? */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              ¿Quiénes no han entrado?
            </h2>
            <Badge variant="secondary">
              <Users2 className="mr-1 size-3.5" aria-hidden />
              {pendientes.length} colaboradores
            </Badge>
          </div>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base">
                Colaboradores con hijos sin elegir
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pendientes.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Todos los colaboradores completaron su selección.
                </p>
              ) : (
                <ul className="divide-y">
                  {pendientes.slice(0, 12).map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{c.nombre}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.area ?? "Sin área"} · CC {c.cedula}
                        </p>
                      </div>
                      <Badge className="shrink-0 bg-warning text-warning-foreground hover:bg-warning">
                        {c.pendientes} de {c.total}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          {pendientes.length > 12 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Mostrando 12 de {pendientes.length}. Exporta desde Selecciones para
              la lista completa.
            </p>
          )}
        </section>
      </div>
    </ShellKidotoy>
  );
}
