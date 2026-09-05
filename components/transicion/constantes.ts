/**
 * Constantes compartidas de la transición de bienvenida.
 *
 * Viven APARTE del proveedor porque `proveedor-transicion.tsx` lleva
 * "use client": Next convierte todas las exportaciones de un módulo cliente en
 * referencias de cliente, así que una constante importada desde un componente
 * de servidor llega como una función proxy, no como el texto. La página de
 * beneficiarios es de servidor y necesita este nombre de atributo.
 */

/** Marca el elemento que entra desde abajo al descubrir (el saludo de la página). */
export const ATRIBUTO_TITULO = "data-transicion-titulo";
