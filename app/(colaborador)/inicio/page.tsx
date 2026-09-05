import { Users } from "lucide-react";
import { MarcaAcueducto, MarcaKidotoy } from "@/components/marca/logotipo";
import { FormaDecorativa } from "@/components/marca/forma-decorativa";
import { BotonCerrarSesion } from "@/components/auth/boton-cerrar-sesion";
import { TarjetaBeneficiario } from "@/components/colaborador/tarjeta-beneficiario";
import { EstadoVacio } from "@/components/estado/estado-vacio";
import { FinTransicion } from "@/components/transicion/fin-transicion";
import { ATRIBUTO_TITULO } from "@/components/transicion/constantes";
import {
  obtenerBeneficiarios,
  obtenerColaborador,
} from "@/lib/colaborador/datos";
import { salirAcceso } from "../actions";

/**
 * "Mis beneficiarios", réplica de la propuesta del cliente: lienzo azul muy
 * claro (no gris), encabezado con el logo del Acueducto y "Portal de bienestar"
 * DEBAJO del logo, la píldora "Regalos en alianza con Kidotoy" a la derecha y
 * una línea divisoria bajo todo el encabezado. Saludo grande en azul y las
 * tarjetas grandes de color por hijo, en rejilla de 2 columnas en escritorio y
 * una sola en móvil. Nota de Kidotoy al pie.
 */

/**
 * Saludo del mockup: "Hola, Diana Martínez". Se arma con el primer nombre y el
 * primer apellido; el nombre completo de cuatro palabras rompería el titular.
 */
function nombreDeSaludo(completo: string | undefined): string {
  const partes = completo?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (partes.length === 0) return "colaborador";
  if (partes.length <= 2) return partes.join(" ");
  return `${partes[0]} ${partes[partes.length - 2]}`;
}

export default async function PaginaInicioColaborador() {
  const [beneficiarios, colaborador] = await Promise.all([
    obtenerBeneficiarios(),
    obtenerColaborador(),
  ]);

  const total = beneficiarios.length;
  const pendientes = beneficiarios.filter((b) => !b.seleccion).length;
  const todosListos = total > 0 && pendientes === 0;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-acueducto-lienzo">
      {/* Retira la capa de la transición de bienvenida, si venimos del login. */}
      <FinTransicion />
      <FormaDecorativa />

      <header className="relative z-10 border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <MarcaAcueducto alturaClase="h-9" />
            <p className="mt-1 text-sm font-medium text-acueducto-azul-vivo sm:text-base">
              Portal de bienestar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full bg-acueducto-pildora px-4 py-2 text-sm font-medium text-acueducto-azul-vivo sm:inline-flex">
              Regalos en alianza con
              <MarcaKidotoy alturaClase="h-5" />
            </span>
            <BotonCerrarSesion
              accion={salirAcceso}
              className="text-acueducto-azul-vivo hover:text-acueducto-azul-vivo"
            />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7">
          <h1
            {...{ [ATRIBUTO_TITULO]: "" }}
            className="font-heading text-3xl font-bold text-acueducto-azul-vivo sm:text-4xl"
          >
            Hola, {nombreDeSaludo(colaborador?.nombre)}
          </h1>
          <p className="mt-2 text-acueducto-azul sm:text-lg">
            {todosListos
              ? "Ya elegiste el regalo de todos tus hijos. Toca cada tarjeta para ver su comprobante."
              : "Selecciona a uno de tus hijos para elegir su regalo. Puedes elegir un juguete por cada uno."}
          </p>
        </div>

        {total === 0 ? (
          <EstadoVacio
            icon={Users}
            titulo="Aún no aparecen tus beneficiarios"
            descripcion="La información de los hijos de cada colaborador la carga la empresa. Si los tuyos deberían aparecer aquí, Recursos Humanos puede revisarlo."
            className="mt-6"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-10">
            {beneficiarios.map((b, i) => (
              <TarjetaBeneficiario key={b.id} b={b} orden={i} />
            ))}
          </div>
        )}
      </main>

      <footer className="relative z-10 px-4 py-8 sm:px-6">
        <p className="mx-auto max-w-6xl text-center text-sm leading-snug text-acueducto-azul">
          Los juguetes de este catálogo son suministrados por Kidotoy, aliado
          oficial del Acueducto para esta actividad.
        </p>
      </footer>
    </div>
  );
}
