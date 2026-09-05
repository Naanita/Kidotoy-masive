import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { LockupMarca } from "@/components/marca/logotipo";

/**
 * Encabezado común de los espacios autenticados del colaborador (y dev): la
 * co-marca acueducto | kidotoy + título + salir.
 */
export function EncabezadoEspacio({
  titulo,
  saludo,
  accionCerrar,
}: {
  titulo: string;
  /** Saludo con el nombre del colaborador; se muestra "Hola, {saludo}". */
  saludo?: string;
  accionCerrar: () => Promise<void>;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <LockupMarca className="shrink-0" />
        <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />
        {/* En móvil no cabe junto al lockup; el saludo se muestra en el hero de
            la página. En desktop sí hay espacio. El título hace lo mismo. */}
        {saludo ? (
          <span className="hidden min-w-0 truncate text-sm sm:inline">
            <span className="text-muted-foreground">Hola, </span>
            <span className="font-semibold text-foreground">{saludo}</span>
          </span>
        ) : (
          <span className="hidden truncate text-sm text-muted-foreground sm:inline">
            {titulo}
          </span>
        )}
      </div>
      <BotonCerrarSesion accion={accionCerrar} />
    </header>
  );
}
