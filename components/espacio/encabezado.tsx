import { obtenerConfigPublica } from "@/lib/theme/config";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";

/** Encabezado común de los espacios autenticados: marca + título + salir. */
export async function EncabezadoEspacio({
  titulo,
  accionCerrar,
}: {
  titulo: string;
  accionCerrar: () => Promise<void>;
}) {
  const config = await obtenerConfigPublica();
  return (
    <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-lg font-semibold">
          {config.marca_nombre}
        </span>
        <span className="text-muted-foreground" aria-hidden>
          ·
        </span>
        <span className="text-sm text-muted-foreground">{titulo}</span>
      </div>
      <BotonCerrarSesion accion={accionCerrar} />
    </header>
  );
}
