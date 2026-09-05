// =====================================================================
//  catalogo-imagenes.mjs — USO LOCAL / OPERATIVO. NO es parte de la app.
//
//  NO importar desde app/, NO exponer por ninguna ruta, NO llega al
//  navegador. Es una herramienta de línea de comandos.
//
//  Lleva las fichas de producto de Kidotoy al catálogo:
//    1. Recorta el producto de la ficha (quita marco, logo y pie de texto)
//       y lo deja cuadrado 800×800 sobre blanco, en WebP + JPG de respaldo.
//    2. Arma una hoja de contacto para revisar antes de subir nada.
//    3. Empareja cada imagen con las referencias del catálogo POR SKU.
//    4. Con --aplicar: crea el bucket, sube y actualiza productos.imagen_url.
//
//  DOS PASOS A PROPÓSITO. Sin --aplicar no toca ni Storage ni la base:
//  recorta, dibuja la hoja de contacto e imprime el mapa para revisión.
//  Con --aplicar hace el trabajo real.
//
//  IDEMPOTENTE: correrlo dos veces deja el mismo estado. El bucket y las
//  políticas son `on conflict` / `drop if exists`, la subida va con upsert
//  sobre la misma ruta, y la URL es determinista a partir del código de
//  referencia.
//
//  Las credenciales se leen del ENTORNO, nunca del archivo. Correr con:
//    npm run catalogo:imagenes              (recorta y muestra el mapa)
//    npm run catalogo:imagenes -- --aplicar (sube y vincula)
// =====================================================================

import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const ENTRADA = path.join(raiz, "docs", "diseno", "fichas");
const SALIDA = path.join(raiz, "docs", "diseno", "catalogo-procesado");
const HOJA = path.join(SALIDA, "_hoja-de-contacto.png");
const MAPA_SKU = path.join(raiz, "scripts", "catalogo-mapa-sku.json");
const RECORTES = path.join(raiz, "scripts", "catalogo-recortes.json");
const SQL_IMAGENES = path.join(raiz, "supabase", "06-imagenes.sql");

const BUCKET = "catalogo";
const LADO = 800; // salida cuadrada
const CALIDAD_WEBP = 82;
const CALIDAD_JPG = 80;
const PESO_OBJETIVO_KB = 120;

const aplicar = process.argv.includes("--aplicar");

// ---------------------------------------------------------------------
//  Geometría de la ficha (medida sobre las 23 fichas, todas 1080×1080)
// ---------------------------------------------------------------------
//  El recorte NO usa rectángulos fijos para el logo ni para el pie: la
//  posición del logo varía entre fichas y varios productos se le acercan
//  por debajo. Se etiquetan COMPONENTES CONEXOS y se descartan los que son
//  claramente plantilla. Así el producto nunca se corta por una máscara.
const ZONA_LOGO = { x: 0.57, y: 0.19 }; // fracción: arriba a la derecha
const PIE_TEXTO = 0.78; // fracción de alto: por debajo, es el bloque de texto
// Distancia a 255 para considerar un píxel "con tinta". Subido de 12 a 26 a
// propósito: algunas fichas llevan devices de marca gris clarísimo detrás, y a
// 12 el device tocaba el texto del pie y los dos formaban UN componente, que ya
// no era pálido ni cabía bajo el corte del pie, así que sobrevivía y estiraba
// la caja. A 26 el device no es tinta y el texto queda suelto, donde el corte
// del pie sí lo agarra. Las sombras suaves del producto también dejan de contar,
// que es justo lo que se quiere: la caja sale más ceñida.
const UMBRAL_BLANCO = 26;
const AREA_MINIMA = 60; // px: por debajo es ruido de compresión
// Tinta mínima que debe alcanzar un componente para considerarse producto.
// Algunas fichas llevan una corona gris clarísima de fondo (device de marca):
// es grande, así que estira la caja, pero es UNIFORMEMENTE pálida. Un juguete
// real siempre tiene algún píxel bien lejos del blanco.
const TINTA_MINIMA = 34;
const AIRE = 42; // px de aire blanco alrededor del producto en la salida de 800
// Anillo del marco de color. El grosor varía entre fichas (37-51 px abajo), y
// dejar un solo píxel de marco es caro: se pega al device gris de fondo y el
// componente resultante ya no es pálido, así que sobrevive y estira la caja.
// Los topes están calculados contra los extremos REALES de producto en las 23
// fichas: x0>=67, y0>=102, x1<=1034, y1<=888.
const MARCO = { izq: 56, der: 42, arr: 52, aba: 58 };

const log = (...a) => console.log(...a);
const kb = (n) => `${Math.round(n / 1024)} KB`;

// ---------------------------------------------------------------------
//  1. RECORTE
// ---------------------------------------------------------------------

/**
 * Separa el producto de la plantilla de la ficha.
 *
 * Devuelve la caja del producto Y un RGB con la plantilla BORRADA (pintada de
 * blanco). Las dos cosas hacen falta: descartar componentes solo encoge la
 * caja, y si el producto es alto o ancho su caja igual se come el logo o el
 * pie, que siguen ahí dentro. Hay que borrarlos de verdad.
 *
 * Cómo se decide qué es plantilla:
 *  - MARCO: bandas de color pegadas al borde. Se borran ANTES de etiquetar,
 *    por posición: en "Pista de carros" la pista toca el marco y, sin borrarlo
 *    primero, pista y marco son un solo componente y se descartaban juntos.
 *  - LOGO Kidotoy: se mueve entre fichas y sus letras son componentes sueltos.
 *    Se descarta el que cabe ENTERO en la esquina superior derecha. Un mando o
 *    una caja que solo asoma por ahí sobrevive, porque su componente baja más.
 *  - PIE: texto centrado abajo; se descarta el que cabe ENTERO bajo el corte.
 */
function separarProducto(data, w, h) {
  const blanco = (p) => {
    const i = p * 3;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
  };

  // 1. Borrar el marco por posición (medido: 46 px a la izquierda, 37 abajo,
  //    más los remates de esquina; el producto nunca entra en este anillo).
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < MARCO.izq || x >= w - MARCO.der || y < MARCO.arr || y >= h - MARCO.aba) {
        blanco(y * w + x);
      }
    }
  }

  // 2. Etiquetar componentes conexos (8-vecinos) de lo que queda con tinta.
  const tinta = new Uint8Array(w * h);
  for (let p = 0, i = 0; p < w * h; p++, i += 3) {
    const d = Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]);
    if (d > UMBRAL_BLANCO) tinta[p] = 1;
  }

  const etiqueta = new Int32Array(w * h).fill(-1);
  const pila = new Int32Array(w * h);
  const limiteLogoX = Math.floor(w * ZONA_LOGO.x);
  const limiteLogoY = Math.floor(h * ZONA_LOGO.y);
  const limitePie = Math.floor(h * PIE_TEXTO);

  const componentes = [];
  for (let inicio = 0; inicio < w * h; inicio++) {
    if (!tinta[inicio] || etiqueta[inicio] !== -1) continue;
    const id = componentes.length;
    let tope = 0;
    pila[tope++] = inicio;
    etiqueta[inicio] = id;
    let x0 = w, y0 = h, x1 = -1, y1 = -1, area = 0, tintaMax = 0;

    while (tope > 0) {
      const p = pila[--tope];
      const x = p % w;
      const y = (p / w) | 0;
      area++;
      const i = p * 3;
      const d = Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]);
      if (d > tintaMax) tintaMax = d;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          const q = ny * w + nx;
          if (tinta[q] && etiqueta[q] === -1) {
            etiqueta[q] = id;
            pila[tope++] = q;
          }
        }
      }
    }
    componentes.push({ x0, y0, x1, y1, area, tintaMax });
  }

  // 3. Clasificar.
  const conservar = new Uint8Array(componentes.length);
  const cuenta = { producto: 0, logo: 0, pie: 0, ruido: 0, palido: 0 };
  let X0 = w, Y0 = h, X1 = -1, Y1 = -1;

  for (let id = 0; id < componentes.length; id++) {
    const c = componentes[id];
    if (c.area < AREA_MINIMA) { cuenta.ruido++; continue; }
    if (c.tintaMax < TINTA_MINIMA) { cuenta.palido++; continue; }
    if (c.x0 >= limiteLogoX && c.y1 <= limiteLogoY) { cuenta.logo++; continue; }
    if (c.y0 >= limitePie) { cuenta.pie++; continue; }
    conservar[id] = 1;
    cuenta.producto++;
    if (c.x0 < X0) X0 = c.x0;
    if (c.y0 < Y0) Y0 = c.y0;
    if (c.x1 > X1) X1 = c.x1;
    if (c.y1 > Y1) Y1 = c.y1;
  }

  if (X1 < 0) return null;

  // 4. Borrar de verdad todo lo que no se conserva.
  for (let p = 0; p < w * h; p++) {
    const id = etiqueta[p];
    if (id !== -1 && !conservar[id]) blanco(p);
  }

  return {
    caja: { left: X0, top: Y0, width: X1 - X0 + 1, height: Y1 - Y0 + 1 },
    cuenta,
  };
}

async function recortarFicha(archivo, overrides) {
  const ruta = path.join(ENTRADA, archivo);
  const base = sharp(ruta).flatten({ background: "#ffffff" });
  const meta = await base.metadata();
  const { data } = await base
    .clone()
    .toColourspace("srgb")
    .raw({ depth: "uchar" })
    .toBuffer({ resolveWithObject: true });

  const manual = overrides[archivo];
  let caja, origen;
  const separado = separarProducto(data, meta.width, meta.height);
  if (manual) {
    caja = { ...manual };
    origen = "manual";
  } else {
    if (!separado) return { archivo, error: "no se encontró producto" };
    caja = separado.caja;
    origen = "automático";
  }

  // Se recorta sobre el buffer LIMPIO (marco, logo y pie ya en blanco) y se
  // centra en el lienzo. Recortar del original metería la plantilla dentro de
  // la caja en cuanto el producto sea alto o ancho.
  const interior = LADO - AIRE * 2;
  const lienzo = sharp(data, {
    raw: { width: meta.width, height: meta.height, channels: 3 },
  })
    .extract({
      left: caja.left,
      top: caja.top,
      width: caja.width,
      height: caja.height,
    })
    .resize(interior, interior, {
      fit: "inside",
      withoutEnlargement: false,
      background: "#ffffff",
    })
    .extend({
      top: 0, bottom: 0, left: 0, right: 0,
      background: "#ffffff",
    })
    .resize(LADO, LADO, {
      fit: "contain",
      position: "centre",
      background: "#ffffff",
    });

  const webp = await lienzo.clone().webp({ quality: CALIDAD_WEBP, effort: 6 }).toBuffer();
  const jpg = await lienzo.clone().jpeg({ quality: CALIDAD_JPG, mozjpeg: true }).toBuffer();

  return { archivo, caja, origen, webp, jpg };
}

// ---------------------------------------------------------------------
//  2. SKU
// ---------------------------------------------------------------------

/**
 * SKU de una ficha. Primero del NOMBRE DEL ARCHIVO (`KDT######`), que es el
 * camino para las fichas que lleguen después: se sueltan en la carpeta con
 * su SKU en el nombre y no hay que tocar nada. Si el nombre no lo trae, se
 * busca en `catalogo-mapa-sku.json`, que es como están las 23 actuales
 * (vienen nombradas por producto, con el SKU solo impreso en la imagen).
 */
function skuDeArchivo(archivo, mapa) {
  const enNombre = archivo.match(/KDT\d{6}/i);
  if (enNombre) return { sku: enNombre[0].toUpperCase(), fuente: "nombre" };
  const delMapa = mapa[archivo];
  if (delMapa) return { sku: delMapa.toUpperCase(), fuente: "mapa" };
  return { sku: null, fuente: null };
}

// ---------------------------------------------------------------------
//  3. HOJA DE CONTACTO
// ---------------------------------------------------------------------

async function hojaDeContacto(resultados) {
  const CELDA = 260, COLS = 6, ETIQUETA = 34;
  const piezas = [];
  for (let i = 0; i < resultados.length; i++) {
    const r = resultados[i];
    const col = i % COLS, fila = Math.floor(i / COLS);
    const x = col * (CELDA + 6), y = fila * (CELDA + ETIQUETA + 6);
    if (r.webp) {
      piezas.push({
        input: await sharp(r.webp).resize(CELDA, CELDA).png().toBuffer(),
        left: x,
        top: y + ETIQUETA,
      });
    }
    const color = r.error ? "#e84141" : r.origen === "manual" ? "#f8ab11" : "#10b7cd";
    const titulo = `${i}. ${r.sku ?? "SIN SKU"}`;
    const sub = r.error ? r.error : `${r.archivo.slice(0, 30)} · ${r.origen}`;
    piezas.push({
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${CELDA}" height="${ETIQUETA}">` +
          `<rect width="${CELDA}" height="${ETIQUETA}" fill="#111"/>` +
          `<text x="5" y="14" font-family="Consolas,monospace" font-size="13" fill="${color}">${titulo}</text>` +
          `<text x="5" y="28" font-family="Consolas,monospace" font-size="10" fill="#999">${sub.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>` +
          `</svg>`,
      ),
      left: x,
      top: y,
    });
  }
  const filas = Math.ceil(resultados.length / COLS);
  await sharp({
    create: {
      width: COLS * (CELDA + 6),
      height: filas * (CELDA + ETIQUETA + 6),
      channels: 3,
      background: "#222222",
    },
  })
    .composite(piezas)
    .png()
    .toFile(HOJA);
}

// ---------------------------------------------------------------------
//  4. SUPABASE
// ---------------------------------------------------------------------

function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !svc) {
    console.error(
      "\n✖ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.\n" +
        "  Correr con: npm run catalogo:imagenes\n",
    );
    process.exit(1);
  }
  return { supabase: createClient(url, svc, { auth: { persistSession: false } }), url };
}

/** URL pública determinista. Misma entrada, misma URL: la vinculación es idempotente. */
const urlPublica = (url, referencia) =>
  `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(referencia)}.webp`;

async function prepararStorage() {
  const { Client } = (await import("pg")).default;
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error("\n✖ Falta SUPABASE_DB_URL en el entorno (para el bucket y sus políticas).\n");
    process.exit(1);
  }
  const sql = await readFile(path.join(raiz, "supabase", "05-storage.sql"), "utf8");
  const cliente = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await cliente.connect();
  try {
    await cliente.query(sql);
  } finally {
    await cliente.end();
  }
}

// ---------------------------------------------------------------------
//  Principal
// ---------------------------------------------------------------------

async function main() {
  const mapaSku = existsSync(MAPA_SKU) ? JSON.parse(await readFile(MAPA_SKU, "utf8")) : {};
  const overrides = existsSync(RECORTES) ? JSON.parse(await readFile(RECORTES, "utf8")) : {};

  const archivos = (await readdir(ENTRADA))
    .filter((f) => /\.(png|jpe?g)$/i.test(f))
    .sort();
  if (archivos.length === 0) {
    log(`\n✖ No hay fichas en ${path.relative(raiz, ENTRADA)}\n`);
    process.exit(1);
  }

  log(`\n▸ Fichas de entrada: ${archivos.length}  (${path.relative(raiz, ENTRADA)})\n`);

  await rm(SALIDA, { recursive: true, force: true });
  await mkdir(SALIDA, { recursive: true });

  // ---- Recorte
  const resultados = [];
  let pesados = 0;
  for (const archivo of archivos) {
    const r = await recortarFicha(archivo, overrides);
    const { sku, fuente } = skuDeArchivo(archivo, mapaSku);
    r.sku = sku;
    r.fuenteSku = fuente;
    if (r.webp) {
      const nombre = sku ?? path.parse(archivo).name;
      await writeFile(path.join(SALIDA, `${nombre}.webp`), r.webp);
      await writeFile(path.join(SALIDA, `${nombre}.jpg`), r.jpg);
      if (r.webp.length > PESO_OBJETIVO_KB * 1024) pesados++;
    }
    resultados.push(r);
    const peso = r.webp ? `${kb(r.webp.length).padStart(7)} webp · ${kb(r.jpg.length).padStart(7)} jpg` : "—";
    log(
      `  ${(sku ?? "SIN SKU").padEnd(10)} ${archivo.slice(0, 40).padEnd(42)} ${r.error ? "✖ " + r.error : peso}`,
    );
  }

  await hojaDeContacto(resultados);
  log(`\n▸ Hoja de contacto: ${path.relative(raiz, HOJA)}`);
  if (pesados) log(`  ⚠ ${pesados} imagen(es) por encima de ${PESO_OBJETIVO_KB} KB`);

  // ---- Mapa contra el catálogo
  const { supabase, url } = clienteAdmin();
  const { data: productos, error } = await supabase
    .from("productos")
    .select("id, codigo_referencia, sku, nombre, edad, genero, imagen_url")
    .order("edad")
    .order("nombre");
  if (error) {
    console.error("\n✖ No se pudo leer productos:", error.message, "\n");
    process.exit(1);
  }

  const porSku = new Map();
  for (const p of productos) {
    if (!p.sku) continue;
    const k = p.sku.toUpperCase();
    if (!porSku.has(k)) porSku.set(k, []);
    porSku.get(k).push(p);
  }

  const vinculos = []; // { referencia, sku, archivo, webp, url }
  const imagenesHuerfanas = [];
  const skusVistos = new Set();

  for (const r of resultados) {
    if (r.error) continue;
    if (!r.sku) {
      imagenesHuerfanas.push({ archivo: r.archivo, motivo: "sin SKU (nombre ni mapa)" });
      continue;
    }
    const filas = porSku.get(r.sku);
    if (!filas) {
      imagenesHuerfanas.push({ archivo: r.archivo, motivo: `SKU ${r.sku} no está en productos` });
      continue;
    }
    skusVistos.add(r.sku);
    // Un juguete unisex ocupa varias filas con distinto codigo_referencia y el
    // MISMO sku: todas apuntan a la misma foto.
    for (const p of filas) {
      vinculos.push({
        referencia: p.codigo_referencia,
        sku: r.sku,
        nombre: p.nombre,
        edad: p.edad,
        genero: p.genero,
        archivo: r.archivo,
        webp: r.webp,
        url: urlPublica(url, p.codigo_referencia),
      });
    }
  }

  const productosSinImagen = productos.filter(
    (p) => !p.sku || !skusVistos.has(p.sku.toUpperCase()),
  );

  log(`\n▸ Mapa imagen → referencia (por SKU, ${vinculos.length} vínculos)\n`);
  for (const v of vinculos) {
    log(
      `  ${v.sku}  ${v.referencia.padEnd(18)} ${String(v.edad).padStart(2)}a ${v.genero.padEnd(5)} ${v.nombre.slice(0, 40).padEnd(42)} ← ${v.archivo.slice(0, 34)}`,
    );
  }

  log(`\n▸ Cobertura: ${productos.length - productosSinImagen.length}/${productos.length} referencias con imagen`);
  if (productosSinImagen.length) {
    log(`\n  Referencias SIN imagen (${productosSinImagen.length}):`);
    for (const p of productosSinImagen) {
      log(`    ${(p.sku ?? "sin sku").padEnd(10)} ${p.codigo_referencia.padEnd(18)} ${p.nombre}`);
    }
  }
  if (imagenesHuerfanas.length) {
    log(`\n  Imágenes SIN referencia (${imagenesHuerfanas.length}):`);
    for (const h of imagenesHuerfanas) log(`    ${h.archivo}  —  ${h.motivo}`);
  }

  if (!aplicar) {
    log(
      "\n────────────────────────────────────────────────────────────\n" +
        "  Nada se subió ni se escribió en la base.\n" +
        "  Revisa la hoja de contacto y el mapa de arriba.\n" +
        "  Para aplicar:  npm run catalogo:imagenes -- --aplicar\n" +
        "────────────────────────────────────────────────────────────\n",
    );
    return;
  }

  // ---- Storage
  log("\n▸ Preparando bucket y políticas…");
  await prepararStorage();

  log(`▸ Subiendo ${vinculos.length} objeto(s) a ${BUCKET}/…`);
  const subidas = new Set();
  for (const v of vinculos) {
    if (subidas.has(v.referencia)) continue;
    const { error: eSubida } = await supabase.storage
      .from(BUCKET)
      .upload(`${v.referencia}.webp`, v.webp, {
        contentType: "image/webp",
        // Son archivos que no cambian: si cambia la foto, cambia el objeto.
        cacheControl: "31536000",
        upsert: true,
      });
    if (eSubida) {
      console.error(`  ✖ ${v.referencia}: ${eSubida.message}`);
      process.exitCode = 1;
      continue;
    }
    subidas.add(v.referencia);
    log(`  ✔ ${v.referencia}.webp`);
  }

  // ---- Vinculación
  log("\n▸ Actualizando productos.imagen_url…");
  for (const v of vinculos) {
    const { error: eUpd } = await supabase
      .from("productos")
      .update({ imagen_url: v.url })
      .eq("codigo_referencia", v.referencia);
    if (eUpd) {
      console.error(`  ✖ ${v.referencia}: ${eUpd.message}`);
      process.exitCode = 1;
    }
  }
  log(`  ✔ ${vinculos.length} referencia(s) vinculada(s)`);

  // ---- Persistir para que db:reset no pierda las imágenes
  const lineas = vinculos
    .map(
      (v) =>
        `update productos set imagen_url = '${v.url.replace(/'/g, "''")}' where codigo_referencia = '${v.referencia.replace(/'/g, "''")}';`,
    )
    .join("\n");
  await writeFile(
    SQL_IMAGENES,
    "-- GENERADO por scripts/catalogo-imagenes.mjs. No editar a mano.\n" +
      "-- Vuelve a poner las URLs de las fotos después de un db:reset, que\n" +
      "-- reinserta el catálogo con imagen_url en null. Regenerar con:\n" +
      "--   npm run catalogo:imagenes -- --aplicar\n\n" +
      lineas +
      "\n",
    "utf8",
  );
  log(`\n▸ Escrito ${path.relative(raiz, SQL_IMAGENES)} (lo aplica db:setup tras el seed)\n`);
}

main().catch((e) => {
  console.error("\n✖", e?.message ?? e, "\n");
  process.exit(1);
});
