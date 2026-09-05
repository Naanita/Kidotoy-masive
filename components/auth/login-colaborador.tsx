"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Loader2, LifeBuoy } from "lucide-react";
import { useTransicion } from "@/components/transicion/proveedor-transicion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type EstadoAcceso = { error: string | null; ok?: boolean };

/**
 * A dónde va el colaborador tras entrar. SIN `?bienvenido=1` a propósito: ese
 * parámetro dispara el toast "Sesión iniciada", y aquí la bienvenida ya la da
 * la transición. Con los dos a la vez, el toast salta sobre la pantalla todavía
 * tapada y se pisan. Los demás espacios (Kidotoy, Acueducto, entrega) sí lo
 * conservan: allí no hay transición.
 */
const DESTINO = "/inicio";
type Accion = (
  prev: EstadoAcceso,
  formData: FormData,
) => Promise<EstadoAcceso>;

/**
 * Formulario del colaborador dentro de la tarjeta azul de la propuesta del
 * cliente. Los campos NO son cajas blancas: van sobre el mismo azul de la
 * tarjeta, con un borde claro y el texto en blanco, tal como el mockup.
 *
 * El mockup rotula "Usuario/Contraseña", pero el sistema entra con cédula +
 * código SAP: se usan esos rótulos, que es lo que la persona tiene en la mano
 * (única desviación del texto, necesaria para que funcione).
 *
 * Ante un fallo: los DOS campos se marcan (`aria-invalid`) y aparece el aviso en
 * línea con el mismo mensaje genérico para los tres casos. No se revela cuál falló.
 *
 * Al acertar, la acción NO redirige desde el servidor: devuelve `ok` y aquí se
 * dispara la transición de bienvenida, que tapa la pantalla y navega. Si no hay
 * animación posible (`prefers-reduced-motion`, GSAP caído), el proveedor navega
 * igual: nadie se queda en el login con la sesión ya abierta.
 */
export function LoginColaborador({ accion }: { accion: Accion }) {
  const [state, formAction, pending] = useActionState(accion, { error: null });
  const { iniciar } = useTransicion();
  const [navegando, setNavegando] = useState(false);
  const yaDisparo = useRef(false);
  const hayError = Boolean(state?.error);

  // `state` cambia de identidad en cada envío, así que el disparo se cierra con
  // una bandera: la transición se lanza una sola vez.
  useEffect(() => {
    if (!state?.ok || yaDisparo.current) return;
    yaDisparo.current = true;
    setNavegando(true);
    iniciar(DESTINO);
  }, [state, iniciar]);

  const claseCampo = [
    "h-12 border-2 border-acueducto-campo bg-transparent text-base text-white",
    "placeholder:text-white/60 focus-visible:border-white focus-visible:ring-white/30",
    // Chrome pinta el autocompletado de amarillo y rompería el campo sobre azul.
    "[&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--primary-foreground))]",
    "[&:-webkit-autofill]:[transition:background-color_9999s]",
    "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive",
  ].join(" ");

  return (
    <form action={formAction}>
      <div className="space-y-4 rounded-2xl bg-acueducto-azul-vivo p-6 sm:p-7">
        <div className="space-y-2">
          <Label htmlFor="cedula" className="text-white">
            Número de cédula
          </Label>
          <Input
            id="cedula"
            name="cedula"
            inputMode="numeric"
            autoComplete="username"
            required
            aria-invalid={hayError}
            className={claseCampo}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codigo_sap" className="text-white">
            Código SAP
          </Label>
          <Input
            id="codigo_sap"
            name="codigo_sap"
            autoComplete="current-password"
            required
            aria-invalid={hayError}
            className={claseCampo}
          />
        </div>

        {hayError && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Botón turquesa BRILLANTE, el color exacto del mockup aprobado. */}
        <Button
          type="submit"
          disabled={pending || navegando}
          className="mt-1 h-12 w-full bg-kido-turquesa text-base font-semibold text-white hover:bg-kido-turquesa/90"
        >
          {(pending || navegando) && (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          )}
          Ingresar
        </Button>

        {/* Texto PLANO a propósito: no hay contacto real de RH todavía. No debe
            parecer tocable —ni color ni subrayado— para que nadie con un problema
            lo toque y no pase nada. Ver PROGRESO. */}
        <p className="pt-1 text-center text-sm leading-snug text-white/85">
          <LifeBuoy className="mr-1.5 inline size-4 -translate-y-px" aria-hidden />
          ¿Problemas para entrar? Escríbele a Recursos Humanos.
        </p>
      </div>
    </form>
  );
}
