import { LoginCorreo } from "@/components/auth/login-correo";
import { accionDev } from "./actions";

/**
 * Login de /dev: herramienta interna, NO usa el login del cliente (ese es la
 * réplica de la propuesta del Acueducto). Tarjeta simple y funcional a propósito.
 */
export default function PaginaDev() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-secondary p-6">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="mb-1 font-heading text-2xl font-semibold text-foreground">
          Panel de desarrollo
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">Acceso restringido.</p>
        <LoginCorreo accion={accionDev} />
      </div>
    </main>
  );
}
