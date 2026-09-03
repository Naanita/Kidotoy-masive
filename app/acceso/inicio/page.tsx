import { CheckCircle2, Inbox } from "lucide-react";
import { EncabezadoEspacio } from "@/components/espacio/encabezado";
import { TarjetaBeneficiario } from "@/components/colaborador/tarjeta-beneficiario";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { obtenerBeneficiarios } from "@/lib/colaborador/datos";
import { salirAcceso } from "../actions";

export default async function PaginaInicioColaborador() {
  const beneficiarios = await obtenerBeneficiarios();
  const total = beneficiarios.length;
  const pendientes = beneficiarios.filter((b) => !b.seleccion).length;
  const todosConfirmados = total > 0 && pendientes === 0;

  return (
    <div className="min-h-dvh">
      <EncabezadoEspacio titulo="Mis beneficiarios" accionCerrar={salirAcceso} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {total === 0 ? (
          <div className="mt-10 text-center">
            <Inbox className="mx-auto size-10 text-muted-foreground" aria-hidden />
            <h1 className="mt-3 text-lg font-semibold">
              No encontramos beneficiarios
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              No hay hijos asociados a tu documento. Si crees que es un error,
              comunícate con Recursos Humanos.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h1 className="text-xl font-semibold">
                Elige el regalo de cada uno
              </h1>
              <p className="text-sm text-muted-foreground">
                {todosConfirmados
                  ? "Ya elegiste el regalo de todos tus hijos."
                  : `Te ${pendientes === 1 ? "falta" : "faltan"} ${pendientes} por elegir.`}
              </p>
            </div>

            {todosConfirmados && (
              <Alert className="mb-4">
                <CheckCircle2 className="size-4" aria-hidden />
                <AlertTitle>¡Listo! Terminaste la selección</AlertTitle>
                <AlertDescription>
                  Guarda el código de entrega de cada hijo para el día del
                  evento. Puedes ver el comprobante cuando quieras.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {beneficiarios.map((b) => (
                <TarjetaBeneficiario key={b.id} b={b} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
