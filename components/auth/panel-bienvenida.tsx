import { MarcaAcueductoBlanco } from "@/components/marca/logotipo";
import { FotoBienvenida } from "./foto-bienvenida";

/**
 * Panel izquierdo del login del colaborador, réplica de la propuesta aprobada:
 * fondo azul institucional, la foto de bienvenida con su forma orgánica y su
 * contorno turquesa, el titular ENCIMA de la foto sobre una banda clara, y al
 * pie la nota de Kidotoy como aliado.
 *
 * En ESCRITORIO la marca va DENTRO del mordisco de la foto: se posiciona en
 * absoluto sobre la misma caja, ocupando el hueco que la forma deja arriba a la
 * izquierda (~31% de ancho y ~26% de alto). Si se cambia la ruta del recorte en
 * `FotoBienvenida`, hay que revisar esos dos porcentajes.
 *
 * En MÓVIL la marca sube y se pone en el flujo, encima de la foto: el mordisco
 * mide el 31% del ancho de la foto y a 390 px eso son ~105 px, donde "Portal de
 * bienestar" no cabe a un tamaño legible. Por eso allí la foto tampoco lleva
 * mordisco (ver `FotoBienvenida`), solo esquinas orgánicas.
 */
export function PanelBienvenida() {
  return (
    <div className="flex flex-col bg-acueducto-azul px-6 py-8 text-white md:px-14 md:py-12">
      <div className="relative md:min-h-[19rem] md:flex-1">
        {/* Marca: en el flujo en móvil, dentro del mordisco en escritorio. */}
        <div className="mb-5 flex w-[11rem] flex-col items-center gap-1.5 md:absolute md:left-0 md:top-0 md:z-10 md:mb-0 md:h-[26%] md:w-[31%] md:justify-start md:pt-1">
          <MarcaAcueductoBlanco alturaClase="h-16 md:h-[58%]" />
          <p className="whitespace-nowrap text-sm font-medium leading-none md:text-base lg:text-lg">
            Portal de bienestar
          </p>
        </div>

        <FotoBienvenida className="aspect-[4/5] w-full sm:aspect-[21/20] md:absolute md:inset-0 md:aspect-auto">
          {/* Banda clara translúcida con el titular en azul, abajo. */}
          <div className="absolute inset-x-0 bottom-0 bg-white/55 px-5 pb-6 pt-4 backdrop-blur-[2px] sm:px-8 sm:pb-7 sm:pt-5">
            <h2 className="font-heading text-xl font-bold leading-tight text-acueducto-azul-vivo sm:text-3xl">
              Nos alegra tenerte aquí.
            </h2>
            <p className="mt-1.5 text-sm leading-snug text-acueducto-azul sm:text-base">
              Este espacio es para ti: elige el regalo que más le va a gustar a
              cada uno de tus hijos esta temporada.
            </p>
          </div>
        </FotoBienvenida>
      </div>

      <p className="mt-7 text-center text-sm leading-snug text-white/90">
        Los juguetes de este catálogo son suministrados por Kidotoy, aliado
        oficial del Acueducto para esta actividad.
      </p>
    </div>
  );
}
