import { MarcaKidotoy } from "@/components/marca/logotipo";
import { PanelBienvenida } from "@/components/auth/panel-bienvenida";
import { FormaDecorativa } from "@/components/marca/forma-decorativa";

/**
 * Login del colaborador (la raíz del sitio), réplica de la propuesta aprobada:
 * panel azul del Acueducto a la izquierda y, a la derecha, sobre el lienzo
 * blanco azulado, "Ingresa a tu portal", la tarjeta de credenciales y el logo de
 * Kidotoy.
 *
 * El corte entre los dos lados NO es una línea recta: el panel claro es una caja
 * de esquinas izquierdas muy redondeadas montada sobre el azul. Para que esa
 * curva se vea, el fondo del `main` tiene que ser el azul —si fuera claro, las
 * esquinas redondeadas recortarían claro sobre claro y no se notaría nada—.
 *
 * En móvil el panel azul pasa a banda superior y el formulario queda debajo.
 */
export function PantallaLogin({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-acueducto-azul md:grid md:grid-cols-[53fr_47fr]">
      <PanelBienvenida />

      <div className="relative flex flex-col justify-center overflow-hidden bg-acueducto-lienzo px-6 py-10 sm:px-10 md:rounded-l-[2.5rem] md:px-12 md:py-12">
        <FormaDecorativa />

        <div className="relative z-10 mx-auto flex w-full max-w-[27rem] flex-col gap-7">
          <div>
            <h1 className="font-heading text-3xl font-bold text-acueducto-azul-vivo sm:text-4xl">
              Ingresa a tu portal
            </h1>
            <p className="mt-3 max-w-md text-acueducto-azul-vivo sm:text-lg">
              Usa las mismas credenciales que te compartió Talento Humano para
              consultar el regalo de tus hijos.
            </p>
          </div>

          <div>{children}</div>

          <MarcaKidotoy alturaClase="h-10" className="self-center" />
        </div>
      </div>
    </main>
  );
}
