import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { LockupMarca } from "@/components/marca/logotipo";

/**
 * Encabezado común de los espacios autenticados del colaborador (y dev): la
 * co-marca acueducto | kidotoy + título + salir.
 */
export function EncabezadoEspacio({
  titulo,
  accionCerrar,
}: {
  titulo: string;
  accionCerrar: () => Promise<void>;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <LockupMarca className="shrink-0" />
        <span aria-hidden className="hidden h-6 w-px bg-border sm:block" />
        {/* El título es redundante con el H1 de la página en móvil: solo desktop. */}
        <span className="hidden truncate text-sm text-muted-foreground sm:inline">
          {titulo}
        </span>
      </div>
      <BotonCerrarSesion accion={accionCerrar} />
    </header>
  );
}
