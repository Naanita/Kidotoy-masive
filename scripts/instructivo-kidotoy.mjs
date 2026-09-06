// =====================================================================
//  instructivo-kidotoy.mjs — USO LOCAL.
//  Genera docs/presentacion/05-Manual-Panel-Kidotoy.pdf: el manual del panel de
//  administración /kidotoy, en A4 VERTICAL, texto e imágenes (no diapositivas).
//
//  Capturas y medidas salen de docs/presentacion/recursos/kidotoy/, producidas
//  por scripts/capturas-kidotoy.mjs contra el sitio en vivo. Las marcas se posicionan
//  con las fracciones MEDIDAS en el navegador, nunca a ojo: si la interfaz
//  cambia, se vuelve a medir y este archivo no se toca.
//
//  Correr con: node scripts/instructivo-kidotoy.mjs
// =====================================================================

import { chromium } from "playwright";
import sharp from "sharp";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import path from "node:path";

const REC = "docs/presentacion/recursos/kidotoy";
const SALIDA = "docs/presentacion/05-Manual-Panel-Kidotoy.pdf";
const SITIO = "acueducto-kidotoy.vaisy.app";

const medidas = JSON.parse(readFileSync(`${REC}/medidas.json`, "utf8"));

/**
 * Recorta la barra lateral azul: ocupa el 18 % del ancho, no aporta nada al
 * capítulo (el título ya dice en qué sección estás) y su recorte agranda todo
 * lo demás un 22 %, que es lo que hace legible la letra de las tablas impresas.
 * Devuelve la imagen recortada y el factor para reubicar las marcas.
 */
const cache = new Map();
async function lienzo(nombre, recortarBarra = true) {
  // La clave incluye si se recorta: la introducción pide la misma captura CON
  // barra lateral y el capítulo la pide sin ella.
  const clave = `${nombre}:${recortarBarra}`;
  if (cache.has(clave)) return cache.get(clave);
  const ruta = `${REC}/${nombre}.png`;
  const meta = await sharp(ruta).metadata();
  let corte = 0;
  if (recortarBarra) {
    const { data, info } = await sharp(ruta)
      .extract({ left: 0, top: Math.floor(meta.height * 0.5), width: Math.floor(meta.width * 0.4), height: 3 })
      .raw().toBuffer({ resolveWithObject: true });
    for (let x = 0; x < info.width; x++) {
      const i = x * info.channels;
      const azul = data[i + 2] > data[i] + 25 && data[i + 2] < 170 && data[i] < 90;
      if (azul) corte = x + 1; else if (corte) break;
    }
    if (corte < meta.width * 0.06) corte = 0;
  }
  const buf = corte
    ? await sharp(ruta).extract({ left: corte, top: 0, width: meta.width - corte, height: meta.height }).toBuffer()
    : readFileSync(ruta);
  const r = { src: `data:image/png;base64,${buf.toString("base64")}`, x0: corte / meta.width };
  cache.set(clave, r);
  return r;
}

/** Caja medida de un bloque, reubicada sobre la imagen ya recortada. */
function caja(vista, clave, x0) {
  const c = medidas[vista]?.[clave];
  if (!c) throw new Error(`Sin medida: "${clave}" en ${vista}. Vuelve a correr scripts/capturas-kidotoy.mjs`);
  const k = 1 - x0;
  return { x: (c.x - x0) / k, y: c.y, w: c.w / k, h: c.h };
}

// ---- Contenido -------------------------------------------------------
const CAPS = [
  {
    n: 1,
    titulo: "Resumen",
    ruta: "/kidotoy/panel",
    para: "Es la pantalla de apertura y la que hay que mirar todos los días mientras la campaña está abierta. Responde cuatro preguntas de un vistazo, sin que haya que buscar nada.",
    vistas: [
      { id: "kid-resumen-a", marcas: [
        ["¿Cuánto falta?", "¿Cuánto falta?", "El porcentaje de avance y tres cifras: confirmados, pendientes y total de beneficiarios. Es el número que se reporta al Acueducto."],
        ["Evolución de la campaña", "Evolución de la campaña", "La curva de confirmaciones por día. Sirve para ver si el ritmo cae y hay que pedirle a Talento Humano que reenvíe el comunicado."],
        ["¿Qué se agota?", "¿Qué se agota?", "Referencias agotadas y por agotarse, más el aviso de cobertura: si algún grupo de edad y género se va a quedar corto, aparece aquí antes de que un papá se encuentre la pantalla vacía."],
        ["¿Quiénes no han entrado?", "¿Quiénes no han entrado?", "Los colaboradores con hijos pendientes, con nombre, área y cédula, y cuántos de sus hijos faltan (por ejemplo 2/3). Con esto el recordatorio se manda dirigido, no masivo."],
      ] },
    ],
    hacer: [
      "Abre esta pantalla al empezar el día y mira el porcentaje de avance.",
      "Revisa «¿Qué se agota?». Si hay referencias por agotarse, decide si repones antes de que se acaben.",
      "Pásale la lista de «¿Quiénes no han entrado?» a Talento Humano para el recordatorio.",
      "Toca «Ver rejilla de cobertura» para saltar a Inventario y ver el detalle por grupo.",
    ],
    ojo: "El aviso de cobertura cuenta los grupos SIN referencias asignadas. En el piloto son 24 de 28: un niño de esos grupos entraría a un catálogo vacío. Antes de producción hay que surtir el catálogo completo.",
  },
  {
    n: 2,
    titulo: "Selecciones",
    ruta: "/kidotoy/selecciones",
    para: "El listado de qué eligió cada niño. Es donde se busca un caso concreto, se exporta el reporte y se libera una selección cuando un papá se equivocó.",
    vistas: [
      { id: "kid-selecciones-a", marcas: [
        ["Buscar nombre", "Buscador", "Busca por nombre del niño, cédula del colaborador o código de entrega. Es la vía rápida cuando llaman preguntando por un caso."],
        ["@filtros", "Filtros", "Edad, género, área y estado. Se combinan entre sí y con el buscador."],
        ["Exportar CSV", "Exportar CSV", "Descarga exactamente lo que estás viendo, con los filtros aplicados. Sirve para pasarlo a Excel o enviarlo al Acueducto."],
        ["@tabla", "El listado", "Una fila por niño: beneficiario, edad, género, colaborador, área, juguete, código de entrega y estado."],
        ["Liberar", "Liberar", "Deshace la selección de ese niño. Es la única acción de esta pantalla que cambia datos."],
      ] },
    ],
    hacer: [
      "Para encontrar un caso: escribe el nombre, la cédula o el código en el buscador.",
      "Para un reporte: aplica los filtros que necesites y toca «Exportar CSV». Se descarga lo filtrado, no todo.",
      "Para deshacer una selección: toca «Liberar» en la fila del niño, escribe el motivo y confirma.",
    ],
    ojo: "Liberar exige un motivo de al menos 10 caracteres, y esa regla se verifica en la base de datos, no en la pantalla. La liberación devuelve la unidad al inventario, el niño vuelve a «Falta elegir» y queda registro en auditoría con tu usuario y la hora. No se puede liberar un regalo que YA fue entregado.",
  },
  {
    n: 3,
    titulo: "Inventario",
    ruta: "/kidotoy/inventario",
    para: "Responde la pregunta que ninguna plataforma genérica responde: no cuánto stock queda, sino si ALCANZA para los niños que todavía no han elegido.",
    vistas: [
      { id: "kid-inventario-a", pie: "Parte superior: la rejilla de cobertura.", marcas: [
        ["Cobertura por edad y género", "Cobertura por edad y género", "Una celda por cada cruce de edad y género. El color NO es la disponibilidad de una referencia: es si el stock de ese grupo alcanza para los que faltan por elegir. Verde suficiente, amarillo ajustado, rojo no alcanza, gris sin referencias."],
        ["Detalle del grupo", "Detalle del grupo", "Al tocar una celda se abre aquí el detalle: unidades disponibles, cuántos faltan por elegir, cuántas referencias y cuántos beneficiarios tiene ese grupo."],
      ] },
      { id: "kid-inventario-b", pie: "Más abajo en la misma pantalla: la tabla de referencias.", marcas: [
        ["Referencias", "Referencias", "Todas las referencias con su stock inicial, lo ya consumido y lo disponible."],
        ["Stock", "Stock", "Edita el total de unidades de esa referencia."],
      ] },
    ],
    hacer: [
      "Mira primero la rejilla: si todo está verde, el inventario alcanza y no hay nada que hacer.",
      "Si una celda sale amarilla o roja, tócala para ver el detalle del grupo.",
      "Para reponer, busca la referencia en la tabla de abajo y toca «Stock».",
      "Escribe el nuevo total de unidades, no las que estás agregando.",
    ],
    ojo: "No puedes fijar un stock menor a lo ya consumido: esas unidades están comprometidas con niños que ya confirmaron. El sistema lo rechaza e indica el mínimo que sí acepta.",
  },
  {
    n: 4,
    titulo: "Entregas",
    ruta: "/kidotoy/entregas",
    para: "El puesto de mando del día del evento. Muestra cómo va la jornada, qué carpa se está quedando atrás y permite corregir una entrega mal registrada.",
    vistas: [
      { id: "kid-entregas-a", pie: "Parte superior: el estado de la jornada.", marcas: [
        ["Jornada de entrega", "Jornada de entrega", "Porcentaje entregado, cuántas van, cuántas faltan y cuántas se entregaron fuera de su carpa."],
        ["Avance por carpa", "Avance por carpa", "El color marca las carpas por debajo del promedio de la jornada, es decir dónde mandar refuerzo. No es el avance absoluto: una carpa al 40 % puede estar bien si el promedio es 43 %."],
      ] },
      { id: "kid-entregas-b", pie: "Más abajo: el registro y la corrección.", marcas: [
        ["Últimas entregas", "Últimas entregas", "Las entregas más recientes con niño, juguete, carpa, cuenta del operario y hora. Las hechas fuera de la carpa asignada quedan señaladas."],
        ["Buscar y revertir una entrega", "Buscar y revertir una entrega", "Busca por niño o por código y permite deshacer una entrega registrada por error."],
      ] },
    ],
    hacer: [
      "Durante la jornada, mira «Avance por carpa» y manda refuerzo a las marcadas.",
      "Para corregir una entrega, búscala en «Buscar y revertir una entrega».",
      "Escribe el motivo y confirma.",
    ],
    ojo: "Revertir una entrega exige motivo de al menos 10 caracteres y queda en auditoría, igual que liberar. Úsalo solo para corregir un registro equivocado, nunca para «volver a entregar».",
  },
  {
    n: 5,
    titulo: "Carpas y referencias",
    ruta: "/kidotoy/carpas",
    para: "Define el mapa físico del evento. Aquí se decide en qué carpa se despacha cada juguete, que es lo que después ve el operario al escanear.",
    vistas: [
      { id: "kid-carpas-a", pie: "Parte superior: las carpas del evento.", marcas: [
        ["Carpas del evento", "Carpas del evento", "Las carpas que existen. Cada una se puede renombrar o eliminar."],
        ["Nombre de la carpa", "Nombre de la carpa", "Escribe el nombre del punto de entrega."],
        ["Agregar", "Agregar", "Crea la carpa con ese nombre."],
      ] },
      { id: "kid-carpas-b", pie: "Más abajo: qué carpa despacha cada juguete.", marcas: [
        ["Referencias por carpa", "Referencias por carpa", "Una fila por referencia, con el selector de la carpa que la despacha. La asignación es POR REFERENCIA, no por edad."],
      ] },
    ],
    hacer: [
      "Crea una carpa por cada punto de entrega real del evento.",
      "Baja a «Referencias por carpa» y asigna cada juguete a su carpa.",
      "Revisa que ninguna referencia quede sin carpa antes del día del evento.",
    ],
    ojo: "La carpa se asigna por referencia y no por edad a propósito: así puedes juntar dos edades en un punto o partir una edad numerosa en dos. Si un juguete es de otra carpa, el operario recibe un aviso pero NO se le bloquea la entrega: queda registrada como entrega fuera de carpa.",
  },
  {
    n: 6,
    titulo: "Operarios de entrega",
    ruta: "/kidotoy/operarios",
    para: "Las cuentas con las que el personal de carpa entra al módulo de entrega. Una cuenta por puesto.",
    vistas: [
      { id: "kid-operarios-a", marcas: [
        ["Nuevo operario", "Nuevo operario", "Crea la cuenta: correo, contraseña, nombre y la carpa que atiende."],
        ["@tabla", "El listado", "Las cuentas existentes con su carpa asignada. La carpa se puede cambiar desde el selector de cada fila."],
      ] },
    ],
    hacer: [
      "Toca «Nuevo operario».",
      "Escribe correo, contraseña (mínimo 8 caracteres), nombre y elige la carpa.",
      "Entrega esas credenciales a la persona que atiende ese puesto.",
    ],
    ojo: "La carpa de la cuenta es lo que el operario ve fijo en la parte superior de su pantalla, y es contra lo que el sistema compara cada juguete. Una cuenta con la carpa equivocada descuadra los conteos del día.",
  },
  {
    n: 7,
    titulo: "Catálogo",
    ruta: "/kidotoy/catalogo",
    para: "Las referencias que pueden elegir los niños. Cada una pertenece a una edad exacta y a un género, y eso determina quién la ve.",
    vistas: [
      { id: "kid-catalogo-a", marcas: [
        ["Nueva referencia", "Nueva referencia", "Da de alta un juguete: código de referencia, nombre, edad, género, stock inicial, SKU, descripción e imagen."],
        ["@tabla", "El listado", "Todas las referencias con su edad, género, stock y estado."],
        ["Editar", "Editar", "Cambia nombre, descripción, imagen y si la referencia sigue activa."],
      ] },
    ],
    hacer: [
      "Para agregar un juguete: toca «Nueva referencia» y llena los datos.",
      "Para corregir el nombre, la descripción o la foto: toca «Editar» en su fila.",
      "Para cambiar unidades: hazlo desde Inventario, no desde aquí.",
    ],
    ojo: "La edad y el género no son un filtro sugerido: un niño de 7 años ve EXACTAMENTE las referencias de edad 7 de su género, nunca las de otra edad, aunque su grupo se quede sin stock. Por eso una referencia mal clasificada desaparece para todo el mundo.",
  },
];

const REGLAS = [
  ["Un regalo por niño", "Es una restricción de la base de datos, no una validación de pantalla. No se puede duplicar ni con doble clic ni con dos pestañas."],
  ["Catálogo por edad exacta y género", "Nunca por rangos. Un niño de 7 años ve solo las referencias de edad 7 de su género."],
  ["La confirmación es irreversible para el colaborador", "Solo desde este panel se puede liberar una selección, y siempre con motivo."],
  ["El descuento de inventario es atómico", "Si dos papás confirman la última unidad en el mismo instante, uno se la lleva y el otro recibe un aviso claro. Lo resuelve el motor de base de datos."],
  ["Toda corrección queda registrada", "Liberar una selección y revertir una entrega exigen motivo y quedan en auditoría con usuario y hora. Nada se corrige en silencio."],
];

const NO_HACE = [
  ["Modo sin conexión", "El módulo de entrega necesita red. Si se cae, se entrega con el listado impreso y se registra después."],
  ["Jornada de rezagados", "No hay una segunda vuelta de entrega."],
  ["Importadores de Excel", "Los colaboradores y el catálogo se cargan por vía técnica, no desde una pantalla."],
  ["Subdominios por empresa", "Hoy es una sola empresa. El modelo lo soporta; las pantallas no."],
  ["Reportes avanzados", "Solo exportación a CSV de los listados."],
  ["Recuperar contraseña", "Si un colaborador pierde su código SAP, lo resuelve Talento Humano."],
];

// ---- Maquetación -----------------------------------------------------
/** Marca roja con halo blanco, para que sobreviva a una impresión en gris. */
function marcaHTML(vista, clave, numero, x0) {
  const c = caja(vista, clave, x0);
  // Se separa el trazo del contenido: apoyado justo sobre el borde del bloque,
  // el grosor de la línea tapaba la primera letra del rótulo que señala.
  const AIRE_X = 0.006, AIRE_Y = 0.009;
  const x = Math.max(0, c.x - AIRE_X), y = Math.max(0, c.y - AIRE_Y);
  const w = Math.min(1 - x, c.w + 2 * AIRE_X + Math.min(0, c.x - AIRE_X));
  const h = Math.min(1 - y, c.h + 2 * AIRE_Y + Math.min(0, c.y - AIRE_Y));
  return `<span class="marca" style="left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;width:${(w * 100).toFixed(2)}%;height:${(h * 100).toFixed(2)}%"><i>${numero}</i></span>`;
}

async function vistaHTML(v, desde, seccion) {
  const { src, x0 } = await lienzo(v.id);
  const marcas = v.marcas.map((m, i) => marcaHTML(v.id, m[0], desde + i, x0)).join("");
  const leyenda = v.marcas.map((m) => `<li><b>${m[1]}.</b> ${m[2]}</li>`).join("");
  // El rótulo va ENCIMA de la imagen: si la vista cae en página nueva, el lector
  // sabe de qué pantalla es sin tener que volver atrás.
  const rotulo = v.pie ? `<p class="rotulo">${seccion} &middot; ${v.pie}</p>` : "";
  return `<div class="bloque">
    ${rotulo}
    <figure class="captura">
      <span class="lienzo"><img src="${src}" alt="">${marcas}</span>
    </figure>
    <ol class="leyenda" style="counter-reset:l ${desde - 1}">${leyenda}</ol>
  </div>`;
}

async function capituloHTML(c) {
  let n = 0;
  const bloques = [];
  for (const v of c.vistas) {
    bloques.push(await vistaHTML(v, n + 1, `${c.n} · ${c.titulo}`));
    n += v.marcas.length;
  }
  return `<section class="cap">
  <header class="cap-cab">
    <span class="cap-num">${c.n}</span>
    <div><h2>${c.titulo}</h2><p class="ruta">${c.ruta}</p></div>
  </header>
  <p class="entrada">${c.para}</p>
  <h3>Qué ves en esta pantalla</h3>
  ${bloques.join("")}
  <h3>Qué hacer</h3>
  <ol class="pasos">${c.hacer.map((p) => `<li>${p}</li>`).join("")}</ol>
  <aside class="ojo"><b>Ten en cuenta</b><p>${c.ojo}</p></aside>
</section>`;
}

const HTML = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Manual del panel Kidotoy</title>
<style>
  @page { size: A4 portrait; margin: 18mm 16mm 20mm; }
  :root{ --azul:#0B3A78; --azul-vivo:#0167D5; --lienzo:#F5FBFB; --gris:#5A6472;
         --texto:#2B2B2B; --linea:#D9E2EC; --turquesa:#10B7CD; --rojo:#E84141;
         --amarillo:#F8AB11; --morado:#8974B3; }
  *{ box-sizing:border-box; }
  body{ margin:0; font-family:"Inter",system-ui,"Segoe UI",sans-serif;
        font-size:10.2pt; line-height:1.55; color:var(--texto); }
  h1,h2,h3{ font-family:"Montserrat",system-ui,sans-serif; color:var(--azul); margin:0; }

  .portada{ page-break-after:always; height:279mm; display:flex; flex-direction:column;
            justify-content:center; background:var(--azul); color:#fff;
            margin:0 -16mm -20mm; padding:0 20mm; position:relative; }
  .portada .kicker{ font-size:9.5pt; letter-spacing:.16em; text-transform:uppercase;
                    color:var(--turquesa); font-weight:700; margin:0 0 10mm; }
  .portada h1{ color:#fff; font-size:30pt; line-height:1.16; margin-bottom:7mm; }
  .portada p{ color:#C8D8F0; font-size:12pt; max-width:120mm; margin:0 0 3mm; }
  .portada .pie{ position:absolute; bottom:18mm; left:20mm; right:20mm; color:#AFC4E0; font-size:9.5pt; }
  .franja{ position:absolute; left:0; right:0; bottom:0; height:7mm; display:flex; }
  .franja i{ flex:1; }
  .franja i:nth-child(1){ background:var(--turquesa) } .franja i:nth-child(2){ background:var(--rojo) }
  .franja i:nth-child(3){ background:var(--amarillo) } .franja i:nth-child(4){ background:var(--morado) }

  .intro{ page-break-after:always; }
  .intro h1{ font-size:19pt; margin-bottom:4mm; }
  .indice{ list-style:none; padding:0; margin:5mm 0 0; }
  .indice li{ display:flex; gap:5mm; align-items:baseline; padding:1.9mm 0; border-bottom:1px solid var(--linea); }
  .indice .n{ font-family:"Montserrat",sans-serif; font-weight:700; color:var(--azul-vivo); min-width:7mm; }
  .indice b{ font-family:"Montserrat",sans-serif; color:var(--azul); }
  .indice span{ color:var(--gris); }

  .cap{ page-break-before:always; }
  .cap-cab{ display:flex; gap:5mm; align-items:center; padding-bottom:3mm;
            border-bottom:2px solid var(--azul); margin-bottom:4mm; }
  .cap-num{ font-family:"Montserrat",sans-serif; font-weight:700; font-size:13pt; color:#fff;
            background:var(--azul-vivo); width:11mm; height:11mm; border-radius:50%;
            display:flex; align-items:center; justify-content:center; flex:0 0 auto; }
  .cap h2{ font-size:19pt; line-height:1.2; }
  .ruta{ margin:1mm 0 0; font-family:ui-monospace,Consolas,monospace; font-size:9pt; color:var(--gris); }
  .entrada{ font-size:10.6pt; margin:0 0 4mm; }
  h3{ font-size:11.5pt; margin:5mm 0 2.5mm; }
  h3+.bloque{ margin-top:0; }

  .bloque{ page-break-inside:avoid; margin-bottom:4mm; }
  /* Altura FIJA y ancho por proporción: así el presupuesto vertical de un
     capítulo es constante y ninguno se parte dejando el aviso huérfano. */
  .captura{ margin:0 0 3mm; text-align:center; page-break-inside:avoid; }
  .captura .lienzo{ position:relative; display:inline-block; max-width:100%; }
  .captura img{ display:block; height:104mm; width:auto; max-width:178mm;
                border:1px solid var(--linea); border-radius:2mm; }
  .captura.libre img{ height:auto; width:100%; }
  .rotulo{ margin:0 0 1.6mm; font-size:8.8pt; color:var(--gris); font-style:italic; }
  /* Halo blanco por fuera y por dentro del trazo: impreso en blanco y negro el
     rojo se vuelve gris medio y sin halo desaparece sobre fondos de color. */
  .marca{ position:absolute; border:2.2pt solid var(--rojo); border-radius:2mm;
          box-shadow:0 0 0 1.6pt #fff, inset 0 0 0 1.6pt #fff; }
  /* Diagonal ARRIBA-IZQUIERDA y por fuera del rectángulo: centrada en la esquina
     tapaba las primeras letras del propio rótulo que señala. */
  .marca i{ position:absolute; left:-6.9mm; top:-6.9mm; width:6.4mm; height:6.4mm;
            background:var(--rojo); color:#fff; border:1.1pt solid #fff; border-radius:50%;
            font-family:"Montserrat",sans-serif; font-style:normal; font-weight:700;
            font-size:8.4pt; display:flex; align-items:center; justify-content:center; }

  ol.leyenda{ margin:0; padding-left:0; list-style:none; counter-reset:l; }
  ol.leyenda li{ counter-increment:l; position:relative; padding-left:8mm; margin-bottom:1.7mm; }
  ol.leyenda li::before{ content:counter(l); position:absolute; left:0; top:0.4mm;
    width:5.6mm; height:5.6mm; border-radius:50%; background:var(--rojo); color:#fff;
    font-family:"Montserrat",sans-serif; font-weight:700; font-size:7.6pt;
    display:flex; align-items:center; justify-content:center; }
  ol.leyenda b{ color:var(--azul); }

  ol.pasos{ margin:0; padding-left:5.5mm; }
  ol.pasos li{ margin-bottom:1.5mm; padding-left:1.5mm; }
  ol.pasos li::marker{ font-family:"Montserrat",sans-serif; font-weight:700; color:var(--azul-vivo); }

  .ojo{ margin:4mm 0 0; padding:3.5mm 4mm 3.5mm 5mm; background:#FDECEC;
        border:1.2pt solid var(--rojo); border-left:2.6mm solid var(--rojo);
        border-radius:1.5mm; page-break-inside:avoid; }
  .ojo b{ font-family:"Montserrat",sans-serif; color:#8E1B1B; font-size:9.5pt;
          text-transform:uppercase; letter-spacing:.06em; }
  .ojo p{ margin:1.5mm 0 0; color:#5A1414; }

  table.reglas{ width:100%; border-collapse:collapse; margin-top:3mm; }
  table.reglas td{ border-bottom:1px solid var(--linea); padding:3mm 0; vertical-align:top; }
  table.reglas td:first-child{ width:54mm; padding-right:6mm;
    font-family:"Montserrat",sans-serif; font-weight:600; color:var(--azul); }
  table.reglas td:last-child{ color:var(--gris); }
  .sello{ margin-top:5mm; padding:3.5mm 5mm; background:var(--lienzo); page-break-before:avoid;
          border:1px solid var(--linea); border-left:2.6mm solid var(--turquesa); border-radius:2mm; }
  .sello b{ font-family:"Montserrat",sans-serif; color:var(--azul); }
</style></head><body>

<div class="portada">
  <p class="kicker">Kidotoy &middot; Panel de administración</p>
  <h1>Manual del panel<br>de administración</h1>
  <p>Qué hace cada sección de <b>/kidotoy</b>, qué se puede hacer en ella y qué reglas no se pueden romper.</p>
  <p class="pie">Plataforma de selección de regalos &middot; ${SITIO}<br>Sebastián Grajales</p>
  <div class="franja"><i></i><i></i><i></i><i></i></div>
</div>

<section class="intro">
  <h1>Cómo entrar</h1>
  <p>El panel se abre en <b>${SITIO}/kidotoy</b> con el correo y la contraseña de la cuenta de administración de Kidotoy. Esa cuenta solo ve este panel: el espacio del colaborador, el del Acueducto y el del operario de entrega tienen cada uno su propio acceso y sus propios permisos.</p>
  <figure class="captura libre"><img src="${(await lienzo("kid-login", false)).src}" alt=""></figure>
  <div class="sello"><b>Una cuenta por persona.</b> No compartas la sesión: cada corrección hecha desde el panel queda registrada con el usuario que la hizo, y eso solo sirve si cada usuario es una persona.</div>
</section>

<section class="intro">
  <h1>Cómo está organizado</h1>
  <p>Una vez dentro, la barra lateral azul de la izquierda tiene las siete secciones del panel, en el orden en que se usan durante la campaña: primero se mira cómo va, después se corrige lo puntual, y al final se prepara el día de la entrega.</p>
  <figure class="captura libre"><img src="${(await lienzo("kid-resumen-a", false)).src}" alt=""></figure>
  <p class="rotulo">La barra lateral, con las siete secciones. En los capítulos las capturas van sin ella, para que lo demás se vea más grande.</p>
  <ol class="indice">
    ${CAPS.map((c) => `<li><span class="n">${c.n}</span><div><b>${c.titulo}</b><br><span>${c.para.split(". ")[0].replace(/\.$/, "")}.</span></div></li>`).join("")}
  </ol>
</section>

${(await Promise.all(CAPS.map(capituloHTML))).join("")}

<section class="cap">
  <header class="cap-cab"><span class="cap-num">&#10003;</span><div><h2>Reglas que no se pueden romper</h2><p class="ruta">Válidas en todo el panel</p></div></header>
  <p class="entrada">Estas cinco reglas las garantiza el motor de base de datos, no la pantalla. No se pueden saltar ni por error ni a propósito.</p>
  <table class="reglas">${REGLAS.map(([t, d]) => `<tr><td>${t}</td><td>${d}</td></tr>`).join("")}</table>

  <h3>Lo que este panel todavía no hace</h3>
  <p style="color:var(--gris);margin:0 0 1mm">Alcance de producción. Está aquí para que nadie lo prometa por error.</p>
  <table class="reglas">${NO_HACE.map(([t, d]) => `<tr><td>${t}</td><td>${d}</td></tr>`).join("")}</table>
</section>

</body></html>`;

const tmp = path.resolve(".manual-kidotoy.html");
writeFileSync(tmp, HTML);
const nav = await chromium.launch();
const page = await nav.newPage();
await page.goto("file://" + tmp, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: SALIDA,
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: `<div style="width:100%;font-family:Inter,sans-serif;font-size:7pt;color:#8A94A0;padding:6mm 16mm 0;">
     <span style="float:left">Manual del panel de administración &middot; Kidotoy</span></div>`,
  footerTemplate: `<div style="width:100%;font-family:Inter,sans-serif;font-size:7pt;color:#8A94A0;padding:0 16mm 6mm;">
     <span style="float:left">${SITIO}</span>
     <span style="float:right">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`,
  margin: { top: "18mm", bottom: "20mm", left: "16mm", right: "16mm" },
});
await nav.close();
unlinkSync(tmp);
console.log("✔", SALIDA);
