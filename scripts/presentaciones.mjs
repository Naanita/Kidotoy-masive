// =====================================================================
//  presentaciones.mjs — USO LOCAL. Genera los cuatro PPTX de docs/presentacion/.
//
//  Identidad del DESIGN.md: azul del Acueducto como marco, colores de Kidotoy
//  como acento, Montserrat en títulos e Inter en cuerpo.
//
//  REGLA DURA: las capturas NUNCA se deforman. Todo el posicionamiento pasa por
//  `encajar()`, que respeta la proporción original y centra dentro de su caja.
//  Si algo no cabe, se recorta antes (docs/presentacion/recursos/rec-*.png) o se
//  le da su propia diapositiva; jamás se estira.
//
//  Correr con: node scripts/presentaciones.mjs
// =====================================================================

import PptxGenJS from "pptxgenjs";
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const CAP = "docs/presentacion/capturas";
const REC = "docs/presentacion/recursos";
const OUT = "docs/presentacion";
const SITIO = "acueducto-kidotoy.vaisy.app";

// ---- Paleta (DESIGN.md). El azul manda; Kidotoy acentúa. -------------
const AZUL_PROFUNDO = "0B3A78";
const AZUL = "135EC3";
const AZUL_VIVO = "0167D5";
const LIENZO = "F5FBFB";
const BLANCO = "FFFFFF";
const TEXTO = "333333";
const GRIS = "5A6472";
const TURQUESA = "10B7CD";
const ROJO = "E84141";
const AMARILLO = "F8AB11";
const MORADO = "8974B3";
const KIDO = [TURQUESA, ROJO, AMARILLO, MORADO];

const TITULO = "Montserrat";
const CUERPO = "Inter";

const W = 13.333, H = 7.5, M = 0.7;

// ---- Proporciones reales de cada imagen, medidas una sola vez --------
const ratios = {};
async function medir(rutas) {
  for (const r of rutas) {
    if (ratios[r]) continue;
    const m = await sharp(r).metadata();
    ratios[r] = m.width / m.height;
  }
}

/** Encaja una imagen en una caja SIN deformarla y la centra. */
function encajar(ruta, x, y, w, h) {
  const r = ratios[ruta];
  if (!r) throw new Error("proporción no medida: " + ruta);
  let iw = w, ih = w / r;
  if (ih > h) { ih = h; iw = h * r; }
  return { path: ruta, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih };
}

// ---- Piezas repetidas -------------------------------------------------
/** Alto reservado al pie de toda lámina de contenido para la franja de marca. */
const PIE = 0.78;

/**
 * Franja de 4 colores Kidotoy: el device de marca, usado como remate.
 * Va en TODAS las láminas, no solo en portadas: si aparece a ratos, se lee
 * como descuido. Los tramos se solapan 0,02 in porque al exportar a PDF los
 * bordes contiguos dejan una costura oscura de 1-2 px.
 */
function franja(s, y = H - 0.16, alto = 0.16) {
  const ancho = W / 4;
  KIDO.forEach((c, i) =>
    s.addShape("rect", {
      x: i * ancho, y, w: ancho + (i < 3 ? 0.02 : 0), h: alto,
      fill: { color: c }, line: { type: "none" },
    }),
  );
}

/** Estima cuántas líneas ocupa un texto en una caja de ancho `ancho` (in). */
function lineas(texto, ancho, pt) {
  // Ancho medio de carácter ≈ 0,5 em. Se queda corto a propósito para no
  // subestimar el número de líneas y pegar un párrafo con el siguiente.
  const porLinea = Math.max(8, Math.floor((ancho * 72) / (pt * 0.52)));
  return texto.split("\n").reduce((n, l) => n + Math.max(1, Math.ceil(l.length / porLinea)), 0);
}

function portada(pptx, sobretitulo, titulo, subtitulo, pie) {
  const s = pptx.addSlide();
  s.background = { color: AZUL_PROFUNDO };
  s.addText(sobretitulo, {
    x: M, y: 1.7, w: W - 2 * M, h: 0.4, fontFace: CUERPO, fontSize: 15,
    color: TURQUESA, charSpacing: 2, bold: true, valign: "top", ...SIN_RELLENO,
  });
  s.addText(titulo, {
    x: M, y: 2.2, w: W - 2 * M - 2.4, h: 1.9, fontFace: TITULO, fontSize: 44,
    bold: true, color: BLANCO, lineSpacing: 50, valign: "top", ...SIN_RELLENO,
  });
  if (subtitulo) {
    s.addText(subtitulo, {
      x: M, y: 4.25, w: W - 2 * M - 2.4, h: 1.1, fontFace: CUERPO, fontSize: 18,
      color: "C8D8F0", lineSpacing: 30, valign: "top", ...SIN_RELLENO,
    });
  }
  if (pie) {
    s.addText(pie, {
      x: M, y: H - 1.25, w: W - 2 * M, h: 0.4, fontFace: CUERPO, fontSize: 13,
      color: "AFC4E0", valign: "top", ...SIN_RELLENO,
    });
  }
  franja(s);
  return s;
}

/** Encabezado de una diapositiva de contenido. Sin líneas bajo el título. */
function encabezado(s, titulo, bajada) {
  s.background = { color: LIENZO };
  s.addText(titulo, {
    x: M, y: 0.42, w: W - 2 * M, h: 0.72, fontFace: TITULO, fontSize: 30,
    bold: true, color: AZUL_PROFUNDO, valign: "top", ...SIN_RELLENO,
  });
  if (bajada) {
    s.addText(bajada, {
      x: M, y: 1.12, w: W - 2 * M, h: 0.42, fontFace: CUERPO, fontSize: 15,
      color: GRIS, valign: "top", ...SIN_RELLENO,
    });
  }
  franja(s);
  return bajada ? 1.68 : 1.32;
}

/**
 * Todo texto va sin relleno interno. pptxgenjs añade ~0,1 in por defecto y eso
 * desplazaba las columnas de texto 19 px respecto a las capturas y las barras.
 */
const SIN_RELLENO = { margin: 0 };

/** Marco blanco de una captura, para despegarla del lienzo. */
function marco(s, img, aire = 0.06) {
  s.addShape("roundRect", {
    x: img.x - aire, y: img.y - aire, w: img.w + 2 * aire, h: img.h + 2 * aire,
    fill: { color: BLANCO }, line: { color: "D9E2EC", width: 1 }, rectRadius: 0.04,
  });
}

/** Una captura sola, lo más grande posible, centrada y sin deformar. */
function slideCaptura(pptx, titulo, bajada, ruta, notas) {
  const s = pptx.addSlide();
  const y0 = encabezado(s, titulo, bajada);
  const img = encajar(ruta, M, y0, W - 2 * M, H - y0 - PIE);
  marco(s, img);
  s.addImage(img);
  s.addNotes(notas);
  return s;
}

/**
 * Varias capturas en fila (secuencia del recorrido).
 *
 * Reparte el ancho en dos pasadas: primero calcula el tamaño natural de cada
 * captura y después reparte el sobrante como huecos IGUALES. Anclar las
 * columnas a un ancho fijo dejaba huecos dispares (70 px contra 119 px) cuando
 * una captura era ancha y las otras altas.
 */
function slideSecuencia(pptx, titulo, bajada, items, notas) {
  const s = pptx.addSlide();
  const y0 = encabezado(s, titulo, bajada);
  const n = items.length;
  const BANDA = 0.86;              // círculo numerado + pie de foto
  const altoMax = H - y0 - PIE - BANDA;
  // Peso: una captura de escritorio necesita más ancho que una de celular.
  const pesos = items.map((it) => it.peso ?? 1);
  const suma = pesos.reduce((a, b) => a + b, 0);
  const anchoUtil = W - 2 * M;

  // El hueco se descuenta ANTES de repartir: si se calcula después, cuatro
  // capturas anchas ocupan todo el ancho útil y la cuarta se sale de la lámina.
  const HUECO = 0.3;
  const paraImagenes = anchoUtil - HUECO * (n - 1);
  const medidas = items.map((it, i) => {
    const tope = (paraImagenes * pesos[i]) / suma;
    const r = ratios[it.ruta];
    let w = tope, h = tope / r;
    if (h > altoMax) { h = altoMax; w = altoMax * r; }
    return { w, h };
  });
  // Todas las capturas de la fila comparten alto: con alturas dispares, los pies
  // se alinean pero los bordes inferiores no, y eso se lee como descuadre.
  // Se igualan cuando la fila es homogénea (todas anchas o todas altas). Se
  // reduce el ALTO y el ancho se recalcula con la proporción: nada se deforma.
  // En una fila mixta (una de escritorio + dos de celular) no se iguala, porque
  // dejaría los celulares diminutos.
  const anchas = items.filter((it) => ratios[it.ruta] > 1).length;
  const homogenea = anchas === 0 || anchas === items.length;
  if (homogenea) {
    const hFila = Math.min(...medidas.map((m) => m.h));
    medidas.forEach((m) => { m.w = m.w * (hFila / m.h); m.h = hFila; });
  }
  const usado = medidas.reduce((a, m) => a + m.w, 0);
  // El sobrante de las capturas altas se reparte como hueco, pero con tope: sin
  // él, tres celulares en una fila dejaban huecos de 3 in.
  const hueco = n > 1 ? Math.min(0.95, HUECO + (anchoUtil - usado - HUECO * (n - 1)) / (n - 1)) : 0;
  const anchoTotal = usado + hueco * (n - 1);
  // El pie va justo bajo la captura más alta, no a una y fija: si no, una fila
  // de capturas anchas deja un vacío enorme entre la imagen y su número.
  const yBanda = y0 + Math.max(...medidas.map((m) => m.h)) + 0.22;

  let x = M + Math.max(0, (anchoUtil - anchoTotal) / 2);
  items.forEach((it, i) => {
    const { w, h } = medidas[i];
    const img = { path: it.ruta, x, y: y0, w, h }; // alineadas por el borde superior
    marco(s, img, 0.05);
    s.addImage(img);
    s.addShape("ellipse", {
      x: x + w / 2 - 0.17, y: yBanda, w: 0.34, h: 0.34,
      fill: { color: AZUL_VIVO }, line: { type: "none" },
    });
    s.addText(String(i + 1), {
      x: x + w / 2 - 0.17, y: yBanda, w: 0.34, h: 0.34, fontFace: TITULO, fontSize: 13,
      bold: true, color: BLANCO, align: "center", valign: "middle",
    });
    // Caja del pie simétrica respecto al centro de la captura pero recortada a
    // los márgenes: una caja fija de 3 in se salía de la lámina en los extremos.
    const cen = x + w / 2;
    const cw = Math.min(3.0, 2 * Math.min(cen - M, W - M - cen));
    s.addText(it.pie, {
      x: cen - cw / 2, y: yBanda + 0.4, w: cw, h: 0.36, fontFace: CUERPO, fontSize: 12,
      color: TEXTO, align: "center", valign: "top", ...SIN_RELLENO,
    });
    x += w + hueco;
  });
  s.addNotes(notas);
  return s;
}

/**
 * Captura a un lado, ideas cortas al otro.
 *
 * La caja de la imagen se ajusta a su tamaño natural: dejarla en un ancho fijo
 * hacía que una captura de celular (muy alta) flotara con 2,4 in de blanco a
 * cada lado. El texto se queda con lo que sobra.
 */
function slideCapturaTexto(pptx, titulo, bajada, ruta, puntos, notas, ladoImg = "der") {
  const s = pptx.addSlide();
  const y0 = encabezado(s, titulo, bajada);
  const hueco = 0.6;
  const altoImg = H - y0 - PIE;
  const anchoUtil = W - 2 * M - hueco;

  const r = ratios[ruta];
  // Ancho natural de la captura, sin pasar de dos tercios del área útil.
  let iw = Math.min(anchoUtil * 0.66, altoImg * r), ih = iw / r;
  if (ih > altoImg) { ih = altoImg; iw = altoImg * r; }
  const anchoTexto = anchoUtil - iw;
  const xTexto = ladoImg === "der" ? M : W - M - anchoTexto;
  const xImg = ladoImg === "der" ? W - M - iw : M;

  // Salto uniforme, calculado sobre la viñeta que más líneas ocupa: con salto
  // por viñeta, dos de dos líneas seguidas quedaban pegadas.
  const anchoV = anchoTexto - 0.42;
  // Hueco fijo DESPUÉS de cada viñeta, no salto fijo de línea base: con salto
  // fijo, una viñeta de dos líneas se come el aire y queda pegada a la siguiente.
  const HUECO_V = 0.34;
  const alturas = puntos.map((p) => lineas(p, anchoV, 15) * 0.30);
  const total = alturas.reduce((a, b) => a + b, 0) + HUECO_V * (puntos.length - 1);
  let y = y0 + Math.max(0, (altoImg - total) / 2);
  puntos.forEach((p, i) => {
    s.addShape("ellipse", {
      x: xTexto, y: y + 0.09, w: 0.15, h: 0.15, fill: { color: TURQUESA }, line: { type: "none" },
    });
    s.addText(p, {
      x: xTexto + 0.32, y, w: anchoV, h: alturas[i], fontFace: CUERPO, fontSize: 15,
      color: TEXTO, lineSpacing: 22, valign: "top", ...SIN_RELLENO,
    });
    y += alturas[i] + HUECO_V;
  });

  const img = { path: ruta, x: xImg, y: y0 + (altoImg - ih) / 2, w: iw, h: ih };
  marco(s, img);
  s.addImage(img);
  s.addNotes(notas);
  return s;
}

/** Diapositiva de invitación: QR grande, URL y credenciales. */
function slideQR(pptx, titulo, bajada, credenciales, notas, oscura = false) {
  const s = pptx.addSlide();
  s.background = { color: oscura ? AZUL_PROFUNDO : LIENZO };
  const col = oscura ? BLANCO : AZUL_PROFUNDO;
  // El QR manda: lo más grande que quepa, sobre blanco y con zona de silencio
  // generosa, porque se escanea proyectado y a varios metros.
  const AIRE = 0.34;
  const qrLado = 4.4;
  // La placa blanca completa (código + zona de silencio) respeta el margen.
  const qrX = W - M - AIRE - qrLado, qrY = (H - PIE - qrLado - 0.5) / 2 + 0.1;
  const anchoIzq = qrX - AIRE - M - 0.45;

  // Alturas reales, no fijas: con título de dos líneas el párrafo se le pegaba.
  const hTit = lineas(titulo, anchoIzq, 32) * 0.52;
  const hBaj = lineas(bajada, anchoIzq, 15) * 0.30 + 0.1;
  const altoIzq = hTit + 0.3 + hBaj + 0.35 + 0.8 + (credenciales.length ? 0.72 + credenciales.length * 0.56 : 0);
  const yIzq = Math.max(0.55, (H - PIE - altoIzq) / 2);
  s.addText(titulo, {
    x: M, y: yIzq, w: anchoIzq, h: hTit, fontFace: TITULO, fontSize: 32, bold: true,
    color: col, valign: "top", ...SIN_RELLENO,
  });
  const yBaj = yIzq + hTit + 0.3;
  s.addText(bajada, {
    x: M, y: yBaj, w: anchoIzq, h: hBaj, fontFace: CUERPO, fontSize: 15,
    color: oscura ? "C8D8F0" : GRIS, lineSpacing: 22, valign: "top", ...SIN_RELLENO,
  });
  const yUrl = yBaj + hBaj + 0.35;
  s.addShape("roundRect", {
    x: M, y: yUrl, w: anchoIzq, h: 0.8, fill: { color: oscura ? "12306B" : BLANCO },
    line: { color: TURQUESA, width: 2 }, rectRadius: 0.06,
  });
  s.addText(SITIO, {
    x: M + 0.22, y: yUrl, w: anchoIzq - 0.44, h: 0.8, fontFace: TITULO, fontSize: 19,
    bold: true, color: oscura ? TURQUESA : AZUL_VIVO, valign: "middle", ...SIN_RELLENO,
  });
  // Tres cuentas de prueba, no una: cada una muestra un momento distinto de la
  // campaña, para que quien prueba no tenga que fiarse de una sola pantalla.
  if (credenciales.length) {
    // Columna 1 ancha para que el descriptor quepa en UNA línea: envuelto, el
    // valor de al lado se centraba entre las dos líneas y quedaba desalineado.
    const colC = 1.6, colS = 1.9;
    const colQ = anchoIzq - colC - colS;
    const cab = [["CUENTA DE PRUEBA", M, colQ], ["CÉDULA", M + colQ, colC], ["CÓDIGO SAP", M + colQ + colC, colS]];
    const yCab = yUrl + 1.15;
    cab.forEach(([t, x, w]) =>
      s.addText(t, {
        x, y: yCab, w, h: 0.28, fontFace: CUERPO, fontSize: 10.5, charSpacing: 1,
        bold: true, color: oscura ? "AFC4E0" : GRIS, valign: "top", ...SIN_RELLENO,
      }),
    );
    let y = yCab + 0.44;
    credenciales.forEach((c, i) => {
      if (i) {
        s.addShape("rect", {
          x: M, y: y - 0.08, w: anchoIzq, h: 0.012,
          fill: { color: oscura ? "1B4A8E" : "D9E2EC" }, line: { type: "none" },
        });
      }
      // Los tres campos anclados ARRIBA, no centrados: así comparten línea base.
      s.addText(c.quien, {
        x: M, y, w: colQ - 0.15, h: 0.42, fontFace: CUERPO, fontSize: 12.5,
        color: oscura ? "C8D8F0" : TEXTO, valign: "top", ...SIN_RELLENO,
      });
      s.addText(c.cedula, {
        x: M + colQ, y: y - 0.03, w: colC - 0.1, h: 0.42, fontFace: TITULO, fontSize: 15,
        bold: true, color: col, valign: "top", ...SIN_RELLENO,
      });
      s.addText(c.sap, {
        x: M + colQ + colC, y: y - 0.03, w: colS, h: 0.42, fontFace: TITULO,
        fontSize: 15, bold: true, color: col, valign: "top", ...SIN_RELLENO,
      });
      y += 0.56;
    });
  }

  // Placa blanca con zona de silencio a los cuatro lados: sin ella, el QR
  // sobre el azul profundo pierde el margen que el lector necesita.
  s.addShape("roundRect", {
    x: qrX - AIRE, y: qrY - AIRE, w: qrLado + 2 * AIRE, h: qrLado + 2 * AIRE,
    fill: { color: BLANCO }, line: { type: "none" }, rectRadius: 0.05,
  });
  s.addImage({ path: `${REC}/qr-sitio-negro.png`, x: qrX, y: qrY, w: qrLado, h: qrLado });
  s.addText("Apunta la cámara del celular", {
    x: qrX - AIRE, y: qrY + qrLado + AIRE + 0.1, w: qrLado + 2 * AIRE, h: 0.32,
    fontFace: CUERPO, fontSize: 12, color: oscura ? "AFC4E0" : GRIS, align: "center", valign: "top",
  });
  franja(s);
  s.addNotes(notas);
  return s;
}

/** Pregunta + respuesta, para la entidad pública. */
function slidePregunta(pptx, pregunta, respuesta, dato, notas) {
  const s = pptx.addSlide();
  s.background = { color: LIENZO };
  // Sin cifra al lado, el texto usa todo el ancho en vez de dejar un cuarto vacío.
  const anchoTexto = dato ? W - 2 * M - 3.8 : W - 2 * M;
  const altoPreg = lineas(pregunta, anchoTexto, 30) * 0.55;
  const altoResp = lineas(respuesta, anchoTexto, 17) * 0.42 + 0.4;
  // El bloque se centra: anclado arriba dejaba un tercio de lámina en blanco.
  const yBloque = Math.max(0.85, (H - PIE - (altoPreg + 0.5 + altoResp)) / 2);
  s.addText("«" + pregunta + "»", {
    x: M, y: yBloque, w: anchoTexto, h: altoPreg, fontFace: TITULO, fontSize: 30, bold: true,
    color: AZUL_PROFUNDO, lineSpacing: 38, valign: "top", ...SIN_RELLENO,
  });
  s.addText(respuesta, {
    x: M, y: yBloque + altoPreg + 0.5, w: anchoTexto, h: altoResp, fontFace: CUERPO, fontSize: 17,
    color: TEXTO, lineSpacing: 28, valign: "top", ...SIN_RELLENO,
  });
  if (dato) {
    const cajaY = yBloque + 0.4;
    s.addShape("roundRect", {
      x: W - M - 3.3, y: cajaY, w: 3.3, h: 2.6, fill: { color: AZUL_PROFUNDO },
      line: { type: "none" }, rectRadius: 0.06,
    });
    s.addText(dato.cifra, {
      x: W - M - 3.3, y: cajaY + 0.3, w: 3.3, h: 1.2, fontFace: TITULO, fontSize: 46, bold: true,
      color: TURQUESA, align: "center", valign: "middle",
    });
    s.addText(dato.pie, {
      x: W - M - 3.1, y: cajaY + 1.5, w: 2.9, h: 0.9, fontFace: CUERPO, fontSize: 13,
      color: "C8D8F0", align: "center", lineSpacing: 18, valign: "top",
    });
  }
  franja(s);
  s.addNotes(notas);
  return s;
}

/** Paso de instructivo: captura de celular + marca roja medida sobre el elemento. */
function slidePaso(pptx, num, titulo, texto, ruta, marcas, aviso, notas) {
  const s = pptx.addSlide();
  s.background = { color: LIENZO };
  // Píldora "PASO n" en vez de círculo numerado: el círculo azul del paso y el
  // círculo rojo de la marca eran el mismo lenguaje visual con dos significados,
  // y al imprimir en gris quedaban idénticos.
  const xCol = M;
  const anchoCol = W - 2 * M - 4.5;
  s.addShape("roundRect", {
    x: xCol, y: 0.5, w: 1.62, h: 0.42, fill: { color: AZUL_VIVO }, line: { type: "none" },
    rectRadius: 0.21,
  });
  s.addText("PASO " + num, {
    x: xCol, y: 0.5, w: 1.62, h: 0.42, fontFace: TITULO, fontSize: 14, bold: true,
    charSpacing: 1, color: BLANCO, align: "center", valign: "middle", ...SIN_RELLENO,
  });
  const hTit = lineas(titulo, anchoCol, 30) * 0.52;
  s.addText(titulo, {
    x: xCol, y: 1.06, w: anchoCol, h: hTit, fontFace: TITULO, fontSize: 30,
    bold: true, color: AZUL_PROFUNDO, valign: "top", ...SIN_RELLENO,
  });

  // El bloque de texto + aviso se centra en la columna: anclado arriba dejaba
  // el cuadrante inferior izquierdo muerto (43 % de lámina en blanco).
  const hTexto = texto ? lineas(texto, anchoCol, 17) * 0.34 + 0.1 : 0;
  const hAviso = aviso ? lineas(aviso, anchoCol - 0.6, 15) * 0.30 + 0.5 : 0;
  const sep = texto && aviso ? 0.4 : 0;
  // Anclado bajo el título con aire fijo, no centrado en toda la columna: al
  // centrarlo quedaba un vacío de hasta 2,5 in entre el título y el párrafo.
  let y = 1.06 + hTit + 0.42;
  if (texto) {
    s.addText(texto, {
      x: xCol, y, w: anchoCol, h: hTexto, fontFace: CUERPO, fontSize: 17,
      color: TEXTO, lineSpacing: 28, valign: "top", ...SIN_RELLENO,
    });
    y += hTexto + sep;
  }
  if (aviso) {
    // Filete izquierdo grueso además del contorno: impreso en gris el relleno
    // rosado desaparece (1,09:1) y sin la barra la caja no se lee como alerta.
    s.addShape("roundRect", {
      x: xCol, y, w: anchoCol, h: hAviso,
      fill: { color: "FDECEC" }, line: { color: ROJO, width: 2.5 }, rectRadius: 0.06,
    });
    s.addShape("rect", { x: xCol, y, w: 0.13, h: hAviso, fill: { color: ROJO }, line: { type: "none" } });
    s.addText(aviso, {
      x: xCol + 0.35, y: y + 0.1, w: anchoCol - 0.6, h: hAviso - 0.2, fontFace: CUERPO,
      fontSize: 15, bold: true, color: "8E1B1B", lineSpacing: 22, valign: "middle", ...SIN_RELLENO,
    });
  }
  // Captura del celular a la derecha, sin deformar.
  const cajaW = 4.0, cajaH = H - 1.2 - PIE + 0.4;
  const img0 = encajar(ruta, W - M - cajaW, 0.6, cajaW, cajaH);
  // Pegada al margen derecho, igual que en slideCapturaTexto: centrada dentro de
  // su caja, el celular saltaba 71 px al pasar de una lámina a otra.
  const img = { ...img0, x: W - M - img0.w };
  s.addShape("roundRect", {
    x: img.x - 0.07, y: img.y - 0.07, w: img.w + 0.14, h: img.h + 0.14,
    fill: { color: BLANCO }, line: { color: "C9D6E3", width: 1 }, rectRadius: 0.1,
  });
  s.addImage(img);
  // Marcas: coordenadas medidas en el navegador, en fracción de la imagen.
  // Contorno grueso + círculo numerado: en blanco y negro el rojo se vuelve gris,
  // así que lo que identifica la marca es el TRAZO y el NÚMERO, no el color.
  (marcas || []).forEach((mk, i) => {
    const b = mk.caja;
    const rx = img.x + b.x * img.w, ry = img.y + b.y * img.h;
    const rw = b.w * img.w, rh = b.h * img.h;
    // Halo blanco DEBAJO del trazo rojo. Impreso en blanco y negro el rojo cae
    // en gris 127 y desaparece sobre botones o tarjetas de color (1,0:1); el
    // halo garantiza el contorno sobre cualquier fondo.
    s.addShape("roundRect", {
      x: rx - 0.05, y: ry - 0.05, w: rw + 0.1, h: rh + 0.1,
      fill: { type: "solid", color: ROJO, transparency: 100 },
      line: { color: BLANCO, width: 7 }, rectRadius: 0.25,
    });
    s.addShape("roundRect", {
      x: rx - 0.05, y: ry - 0.05, w: rw + 0.1, h: rh + 0.1,
      fill: { type: "solid", color: ROJO, transparency: 100 },
      line: { color: ROJO, width: 3.5 }, rectRadius: 0.25,
    });
    // x fija a la izquierda de la captura: colgarlos de cada marca los montaba
    // sobre la pantalla del celular cuando la marca tocaba el borde izquierdo.
    const cx = img.x - 0.58, cy = ry + rh / 2 - 0.19;
    s.addShape("ellipse", {
      x: cx - 0.03, y: cy - 0.03, w: 0.44, h: 0.44, fill: { color: BLANCO }, line: { type: "none" },
    });
    s.addShape("ellipse", {
      x: cx, y: cy, w: 0.38, h: 0.38, fill: { color: ROJO }, line: { color: "8E1B1B", width: 1 },
    });
    s.addText(String(mk.n ?? i + 1), {
      x: cx, y: cy, w: 0.38, h: 0.38, fontFace: TITULO, fontSize: 14, bold: true,
      color: BLANCO, align: "center", valign: "middle",
    });
  });
  franja(s);
  s.addNotes(notas);
  return s;
}

/**
 * Rejilla de tarjetas. Título y cuerpo anclados ARRIBA y con la misma altura de
 * título en toda la fila: centrar cada bloque desalineaba las líneas base 14-15
 * px cuando una tarjeta tenía título de dos líneas y su vecina de una.
 */
function slideLista(pptx, titulo, bajada, bloques, notas, color = AZUL_VIVO) {
  const s = pptx.addSlide();
  const y0 = encabezado(s, titulo, bajada);
  const cols = 2;
  const anchoCol = (W - 2 * M - 0.5) / cols;
  const anchoTexto = anchoCol - 0.6;
  const filas = Math.ceil(bloques.length / cols);
  const disponible = H - y0 - PIE;
  const gap = 0.26;
  const amplio = bloques.length <= 2;          // pocas tarjetas: más cuerpo, no más aire
  const ptT = amplio ? 20 : 16, ptD = amplio ? 15 : 13;
  const pad = amplio ? 0.34 : 0.22;
  // La tarjeta se ajusta a su contenido. Con altura tope fija, cuatro tarjetas
  // quedaban con la mitad de la caja vacía.
  // Altura de título uniforme POR FILA (para que los cuerpos alineen) y altura
  // de tarjeta calculada con el peor caso título+cuerpo de toda la rejilla: si
  // solo se mira el título, un cuerpo de dos líneas se sale por abajo.
  const altoT = [];
  for (let f = 0; f < filas; f++) {
    const enFila = bloques.slice(f * cols, f * cols + cols);
    altoT[f] = Math.max(...enFila.map((b) => lineas(b.t, anchoTexto, ptT))) * (ptT / 72 + 0.10);
  }
  const necesita = Math.max(
    ...bloques.map((b, i) =>
      pad * 2 + altoT[Math.floor(i / cols)] + 0.08 +
      lineas(b.d, anchoTexto, ptD) * (ptD / 72 + 0.09)),
  );
  const alto = Math.min(necesita + 0.10, (disponible - gap * (filas - 1)) / filas);
  const yInicio = y0 + Math.max(0, (disponible - (alto * filas + gap * (filas - 1))) / 2);

  bloques.forEach((b, i) => {
    const f = Math.floor(i / cols);
    const x = M + (i % cols) * (anchoCol + 0.5);
    const y = yInicio + f * (alto + gap);
    s.addShape("roundRect", {
      x, y, w: anchoCol, h: alto, fill: { color: BLANCO },
      line: { color: "D9E2EC", width: 1 }, rectRadius: 0.06,
    });
    s.addShape("rect", { x, y, w: 0.07, h: alto, fill: { color }, line: { type: "none" } });
    s.addText(b.t, {
      x: x + 0.3, y: y + pad, w: anchoTexto, h: altoT[f], fontFace: TITULO, fontSize: ptT,
      bold: true, color: AZUL_PROFUNDO, valign: "top", ...SIN_RELLENO,
    });
    s.addText(b.d, {
      x: x + 0.3, y: y + pad + altoT[f] + 0.08, w: anchoTexto, h: alto - pad - altoT[f] - 0.2,
      fontFace: CUERPO, fontSize: ptD, color: GRIS, lineSpacing: amplio ? 21 : 18,
      valign: "top", ...SIN_RELLENO,
    });
  });
  s.addNotes(notas);
  return s;
}

function nuevo(titulo, asunto) {
  const p = new PptxGenJS();
  // El LAYOUT_WIDE nativo de pptxgenjs mide 13,3 x 7,5, no 13,333: se define uno
  // propio para que el lienzo coincida EXACTO con W/H y nada quede fuera de lámina.
  p.defineLayout({ name: "KIDO16X9", width: W, height: H });
  p.layout = "KIDO16X9";
  p.author = "Sebastián Grajales";
  p.company = "Kidotoy";
  p.title = titulo;
  p.subject = asunto;
  return p;
}

// =====================================================================
export async function construir(marcasJSON) {
  const mk = marcasJSON;
  const R = (n) => `${REC}/${n}.png`;
  const C = (n) => `${CAP}/${n}.png`;

  await medir([
    C("escritorio-01-login-colaborador"), C("escritorio-02-mis-beneficiarios"),
    C("escritorio-04-confirmacion"), R("panel-escritorio-06-kidotoy-resumen"),
    C("escritorio-13-entrega-buscar"), C("escritorio-14-entrega-ficha"),
    C("escritorio-15-entrega-entregado"),
    C("movil-01-login-colaborador"), C("movil-02-mis-beneficiarios"),
    C("movil-03-catalogo-valentina"), C("movil-04-comprobante"),
    C("movil-05-entrega-buscar"), C("movil-06-entrega-ficha"), C("movil-07-entrega-entregado"),
    R("rec-escritorio-03-catalogo-valentina"), R("rec-escritorio-05-comprobante"),
    R("panel-escritorio-07-kidotoy-inventario"), R("rec-escritorio-08-kidotoy-selecciones"),
    R("panel-escritorio-09-kidotoy-entregas"), R("rec-escritorio-10-kidotoy-carpas"),
    R("rec-escritorio-11-acueducto-resumen-y-pendientes"),
    R("rec-escritorio-12-acueducto-selecciones"),
    R("rec-movil-01-login-colaborador"), R("rec-movil-02-mis-beneficiarios"),
    R("rec-movil-03-catalogo-valentina"), R("rec-movil-04-comprobante"),
    R("rec-movil-06-entrega-ficha"),
    R("ins-01-login"), R("ins-02-hijos"), R("ins-03-catalogo"),
    R("ins-04-confirmar"), R("ins-05-comprobante"),
    R("ins-op-01-buscar"), R("ins-op-02-ficha"),
    R("ins-op-03-ya-entregado"), R("ins-op-04-otra-carpa"),
    R("panel-escritorio-06-kidotoy-resumen"), R("panel-escritorio-07-kidotoy-inventario"),
    R("panel-escritorio-09-kidotoy-entregas"),
  ]);

  await deck1(C, R);
  await deck2(C, R);
  await deck3(R, mk);
  await deck4(C, R, mk);
}

// ══════════════ 1 · KIDOTOY — ENTREGA ══════════════
async function deck1(C, R) {
  const p = nuevo("Plataforma de selección de regalos · Piloto entregado", "Entrega del piloto a Kidotoy");

  portada(p, "KIDOTOY × ACUEDUCTO DE BOGOTÁ",
    "Plataforma de selección\nde regalos",
    "Piloto entregado y funcionando en vivo",
    "Sebastián Grajales · 6 de septiembre de 2026")
    .addNotes("Buenos días. Les traigo el piloto terminado y funcionando. No es una maqueta: está en internet, lo pueden abrir ahora mismo desde el celular. Hoy quiero mostrarles el recorrido completo, lo que ustedes van a ver desde su panel, y cerrar con lo que necesito de ustedes para pasar a producción.");

  slideLista(p, "Qué pedían y qué construimos", "El requerimiento, punto por punto", [
    { t: "Un regalo por niño", d: "Garantizado en la base de datos, no solo en la pantalla. Es imposible duplicar." },
    { t: "Catálogo por edad y género", d: "Cada niño ve exactamente las 6 referencias de su grupo. Nunca las de otro." },
    { t: "Inventario en vivo", d: "La disponibilidad se actualiza sola mientras la gente elige." },
    { t: "Elección irreversible", d: "El papá confirma y queda. Solo ustedes pueden liberar una selección." },
    { t: "Control de la entrega", d: "Código y QR por niño. El operario escanea, verifica y marca." },
    { t: "Visibilidad para el Acueducto", d: "Portal de solo consulta con su avance y sus reportes." },
  ], "Estos son los seis puntos del requerimiento. Quiero destacar el primero y el cuarto: 'un regalo por niño' y 'la elección es irreversible' no están resueltos con una validación de pantalla, que se salta con un doble clic. Están resueltos en el motor de base de datos. Es la diferencia entre que parezca que funciona y que funcione.");

  slideQR(p, "El sitio está en vivo",
    "Ábranlo ahora. Tres cuentas de prueba, cada una en un momento distinto de la campaña. Los datos son ficticios.",
    [
      { quien: "Diana · tres hijos, dos por elegir", cedula: "52318904", sap: "SAP-007340" },
      { quien: "Valeria · empieza de cero", cedula: "52350129", sap: "SAP-095044" },
      { quien: "Antonia · ya terminó, ve comprobantes", cedula: "80298382", sap: "SAP-054153" },
    ],
    "Ábranlo mientras hablo. Les dejo tres cuentas para que vean tres momentos distintos: Diana va a mitad de camino y tiene hijos de 4, 6 y 10 años, así que ve tres catálogos distintos bajo un mismo usuario; Valeria arranca de cero; y Antonia ya terminó y solo consulta sus comprobantes. Los datos son ficticios, ninguno es real.", true);

  slideSecuencia(p, "El recorrido del colaborador", "Cuatro pantallas, de principio a fin", [
    { ruta: C("escritorio-01-login-colaborador"), pie: "Ingresa con cédula y código" },
    { ruta: C("escritorio-02-mis-beneficiarios"), pie: "Ve a sus hijos y su estado" },
    { ruta: R("rec-escritorio-03-catalogo-valentina"), pie: "Elige entre 6 opciones" },
    { ruta: R("rec-escritorio-05-comprobante"), pie: "Recibe su código y QR" },
  ], "Cuatro pasos. Nada más. Fíjense en la segunda: un hijo ya confirmado con su juguete y dos pendientes en rojo. Si el papá duda si guardó o no, lo ve de una. Eso es lo que evita llamadas a Recursos Humanos.");

  slideSecuencia(p, "Lo que ve el papá en el celular", "La mayoría va a entrar así, no desde un computador", [
    { ruta: R("rec-movil-01-login-colaborador"), pie: "Ingreso" },
    { ruta: R("rec-movil-02-mis-beneficiarios"), pie: "Sus hijos" },
    { ruta: R("rec-movil-03-catalogo-valentina"), pie: "Catálogo" },
    { ruta: R("rec-movil-04-comprobante"), pie: "Comprobante" },
  ], "Está diseñado para el celular primero. Botones grandes, una sola columna, nada de zoom. El comprobante lleva el QR que después se escanea en la carpa, y se puede copiar o descargar.");

  slideCapturaTexto(p, "El panel de ustedes", null, R("panel-escritorio-06-kidotoy-resumen"), [
    "Avance de la campaña en tiempo real",
    "Selecciones a medida que entran",
    "Inventario editable por referencia",
    "Liberar una selección, con motivo y registro",
  ], "Este es su panel. El avance se actualiza solo. Desde aquí liberan una selección si un papá se equivocó, pero el sistema les exige escribir el motivo y lo deja registrado en auditoría. Nadie puede deshacer algo sin dejar rastro.");

  slideCaptura(p, "Saber si el inventario alcanza",
    "Cruza el stock disponible con los niños que todavía no han elegido, grupo por grupo",
    R("panel-escritorio-07-kidotoy-inventario"),
    "Esta es la pieza que no encuentran en ninguna plataforma genérica. No les dice cuánto stock queda: les dice si ALCANZA. Cruza las unidades disponibles contra los niños de ese grupo que todavía no han elegido. Si un grupo se va a quedar corto, lo ven antes de que un papá se encuentre con la pantalla vacía, y todavía hay tiempo de reponer.");

  slideSecuencia(p, "La jornada del 12 de diciembre", "El panel de control y lo que usa el operario en la carpa", [
    { ruta: R("panel-escritorio-09-kidotoy-entregas"), pie: "Avance por carpa, desde el panel", peso: 1.9 },
    { ruta: R("rec-movil-06-entrega-ficha"), pie: "El operario verifica", peso: 1 },
    { ruta: C("movil-07-entrega-entregado"), pie: "Marca entregado", peso: 1 },
  ], "El operario entra con su cuenta y arriba le queda fijo el nombre de su carpa. Escanea el QR del papá, ve el niño y el juguete, y marca. Verde es adelante, rojo es alto. Está pensado para usarse de pie, con una mano y con sol de frente.");

  slideCapturaTexto(p, "Lo que el Acueducto vería", "Portal de solo consulta", R("rec-escritorio-11-acueducto-resumen-y-pendientes"), [
    "Avance de la campaña",
    "Quiénes faltan por elegir",
    "Alertas de referencias por agotarse",
    "Exportación a CSV",
    "NO puede editar inventario ni liberar selecciones",
  ], "Importante el último punto: el Acueducto ve todo pero no toca nada. No puede editar inventario ni liberar selecciones. Eso les da tranquilidad a ustedes y transparencia a ellos al mismo tiempo.");

  slidePregunta(p, "Dos papás, un juguete, el mismo segundo",
    "El descuento de inventario ocurre dentro de una sola transacción de base de datos. El primero se lleva la unidad; el segundo recibe un mensaje claro y la pantalla se le corrige sola.\n\nLo probamos sobre el sitio en vivo, con red real y dos usuarios distintos.",
    { cifra: "0,5 s", pie: "en actualizarse la pantalla del segundo, sin recargar" },
    "Esto es lo que separa una plataforma seria de una hoja de cálculo bonita. Si dos papás confirman la última unidad en el mismo instante, uno gana y el otro se entera al momento. Sin esto se comprometen regalos que no existen, y eso se descubre el 12 de diciembre con la familia enfrente. Lo probé en producción, no en mi computador.");

  slideLista(p, "Qué NO está construido todavía", "Alcance de producción. Lo digo ahora para que nadie lo prometa por error", [
    { t: "Modo sin conexión", d: "Si se cae la red en la carpa, hoy no hay registro local. Alcance de producción." },
    { t: "Jornada de rezagados", d: "La segunda vuelta de entrega no está hecha." },
    { t: "Importadores de Excel", d: "Colaboradores y catálogo entran por carga técnica, no por pantalla." },
    { t: "Subdominios por empresa", d: "Hoy es una sola empresa. El modelo lo soporta; las pantallas no." },
    { t: "Reportes avanzados", d: "Solo exportación a CSV de cuatro listados." },
    { t: "Recuperar contraseña", d: "Si un papá pierde su código SAP, lo resuelve Recursos Humanos." },
  ], "Prefiero decirles esto yo antes de que lo descubran en una demostración con el cliente. Nada de esto está construido. Si en la propuesta al Acueducto aparece alguno, tiene que ir como alcance de producción, con su tiempo y su costo. Lo que sí está, está probado.", ROJO);

  slideLista(p, "Qué necesito de ustedes", "Para pasar del piloto a producción", [
    { t: "Catálogo completo", d: "Las 168 referencias con edad, género y stock. Hoy hay 24." },
    { t: "Fotos que faltan", d: "23 de 24 tienen foto. Falta la ficha de la Cancha Elefante." },
    { t: "Horario del evento", d: "Tenemos fecha y lugar. La hora sigue vacía a propósito." },
    { t: "Contacto de Recursos Humanos", d: "Para el «¿problemas para entrar?» del login." },
    { t: "Mapa real de carpas", d: "Cuántos puntos y qué referencias despacha cada uno." },
    { t: "Cuentas de operario", d: "Una por puesto de entrega." },
  ], "Seis cosas. Las dos primeras son las que más tiempo toman de su lado. El horario del evento lo dejé vacío a propósito: prefiero un dato ausente a uno inventado que nadie corrige y termina impreso en mil comprobantes.");

  portada(p, "SIGUIENTES PASOS",
    "El piloto queda abierto\npara que lo prueben",
    "Ustedes lo revisan y lo muestran al Acueducto. Cuando tenga el catálogo completo y el mapa de carpas, montamos producción en la infraestructura de Kidotoy.",
    "acueducto-kidotoy.vaisy.app · Sebastián Grajales")
    .addNotes("Queda abierto para que lo prueben con calma y lo muestren. Cuando me den catálogo completo y mapa de carpas, la migración a producción es cuestión de días, no de semanas. Quedo atento a lo que encuentren probándolo.");

  await p.writeFile({ fileName: `${OUT}/01-Kidotoy-Entrega.pptx` });
  console.log("✔ 01-Kidotoy-Entrega.pptx");
}

// ══════════════ 2 · ACUEDUCTO — PROPUESTA ══════════════
async function deck2(C, R) {
  const p = nuevo("Programa de regalos de fin de año", "Propuesta al Acueducto de Bogotá");

  portada(p, "PROPUESTA · EMPRESA DE ACUEDUCTO Y ALCANTARILLADO DE BOGOTÁ",
    "Programa de regalos\nde fin de año",
    "Kidotoy · juguetes, logística y entrega\nPlataforma de selección en línea",
    "Presentación conjunta · 2026")
    .addNotes("Buenos días. Kidotoy trae la experiencia en juguetes, la logística y la entrega. Yo acompaño con la plataforma que hace que mil familias puedan elegir sin que nadie tenga que llevar una hoja de cálculo. Hoy queremos mostrarles cómo lo vive un colaborador de ustedes.");

  slideLista(p, "El reto", "Lo que hay que resolver en una sola temporada", [
    { t: "Cerca de 1.000 niños", d: "Cada uno con su edad, su género y su juguete asignado." },
    { t: "Unos 500 colaboradores", d: "Muchos entrando el mismo día, apenas sale el comunicado." },
    { t: "168 referencias", d: "Con inventario limitado. Lo que se acaba, se acabó." },
    { t: "Un solo día de entrega", d: "Cientos de familias, varias carpas, sin filas eternas." },
  ], "Cuatro cifras que definen el problema. La difícil no es la primera, es la combinación: quinientas personas eligiendo casi al tiempo sobre un inventario que se agota, y un solo día para entregar. Eso por correo o por planilla no se sostiene.");

  slideSecuencia(p, "Cómo lo vive el colaborador", "Cuatro pasos, sin capacitación", [
    { ruta: C("escritorio-01-login-colaborador"), pie: "Entra con su cédula" },
    { ruta: C("escritorio-02-mis-beneficiarios"), pie: "Ve a sus hijos" },
    { ruta: R("rec-escritorio-03-catalogo-valentina"), pie: "Elige el regalo de cada uno" },
    { ruta: R("rec-escritorio-05-comprobante"), pie: "Guarda su comprobante" },
  ], "Este es el corazón de todo. Un colaborador entra con su cédula y el código que ustedes le entregan, ve a sus hijos, elige y guarda su comprobante. Sin instructivos largos, sin llamar a nadie. Cada niño ve solo los juguetes de su edad y su género.");

  slideSecuencia(p, "Desde el celular, en tres minutos", "La mayoría de sus colaboradores va a entrar así", [
    { ruta: R("rec-movil-01-login-colaborador"), pie: "Ingreso" },
    { ruta: R("rec-movil-02-mis-beneficiarios"), pie: "Sus hijos" },
    { ruta: R("rec-movil-03-catalogo-valentina"), pie: "Elección" },
    { ruta: R("rec-movil-04-comprobante"), pie: "Comprobante" },
  ], "Pensado para el celular desde el primer trazo, porque es donde va a ocurrir. Un operario de red en campo lo abre en el bus y en tres minutos resolvió el regalo de sus hijos.");

  slideSecuencia(p, "El día del evento", "Cada obsequio queda trazado: quién lo recibió, cuándo y cuál", [
    { ruta: C("movil-05-entrega-buscar"), pie: "El operario escanea el QR" },
    { ruta: R("rec-movil-06-entrega-ficha"), pie: "Verifica niño y juguete" },
    { ruta: C("movil-07-entrega-entregado"), pie: "Marca la entrega" },
  ], "En la carpa, el papá muestra su comprobante, el operario escanea y aparece el niño con su juguete. Marca entregado y queda registrado. Si alguien intenta reclamar dos veces, la pantalla se pone roja y avisa que ya fue entregado.");

  slideCapturaTexto(p, "Lo que ve Talento Humano", "Portal de consulta permanente", R("rec-escritorio-11-acueducto-resumen-y-pendientes"), [
    "Avance de la campaña, actualizado solo",
    "Quiénes faltan por elegir, con nombre y área",
    "Alertas de referencias por agotarse",
    "Exportación a CSV para sus informes",
  ], "Ustedes tienen su propio acceso, permanente, sin pedirle nada a nadie. Ven el avance, quiénes faltan —con nombre y área, para hacer el recordatorio dirigido— y exportan lo que necesiten para sus informes internos.");

  slideQR(p, "Pruébenlo ustedes mismos",
    "Saquen el celular y ábranlo ahora. Es el sistema real funcionando; elijan cualquiera de las tres cuentas de prueba.",
    [
      { quien: "Diana · tres hijos, dos por elegir", cedula: "52318904", sap: "SAP-007340" },
      { quien: "Valeria · empieza de cero", cedula: "52350129", sap: "SAP-095044" },
      { quien: "Antonia · ya terminó, ve comprobantes", cedula: "80298382", sap: "SAP-054153" },
    ],
    "Los invito a abrirlo ahora mismo, mientras estamos acá. Es el sistema real, con datos ficticios. Hay tres cuentas para que cada quien pruebe una: Diana tiene tres hijos de edades distintas y ve cómo cambia el catálogo; Valeria empieza de cero; Antonia ya terminó y consulta sus comprobantes. Les doy un minuto y seguimos con las preguntas que siempre surgen.", true);

  slidePregunta(p, "¿Y si entran quinientas personas al mismo tiempo?",
    "El control de inventario no vive en la pantalla: vive en el motor de base de datos, dentro de una transacción. Dos personas no pueden llevarse la misma última unidad, sin importar cuántas entren a la vez.\n\nEl primero se la lleva; al segundo se le actualiza la pantalla sola y elige otro. Probado sobre el sistema en producción, con red real.",
    { cifra: "0,5 s", pie: "en corregirse la pantalla del segundo, sin recargar" },
    "Es la primera pregunta que hace un área de tecnología, y con razón. La respuesta corta: la garantía está en la base de datos, no en el navegador. Si estuviera en el navegador, un doble clic la rompe. Y no es teoría: lo probamos sobre el sistema publicado, con dos usuarios reales y red de por medio.");

  slidePregunta(p, "¿Cómo se protegen los datos de mil menores?",
    "El aislamiento se aplica en el motor de base de datos, no en el código de la aplicación: aunque una consulta estuviera mal escrita, no puede devolver datos de otra empresa.\n\nSe almacena únicamente lo indispensable para asignar el obsequio: nombre, edad y género. Ni documento del menor, ni fotos, ni datos de salud.\n\nToda operación queda en un registro de auditoría: quién, qué y cuándo.",
    { cifra: "1581", pie: "Ley 1581 de 2012 · tratamiento de datos personales" },
    "Aquí suele entrar jurídico. Tres ideas: el aislamiento es del motor de base de datos, no del código, que es el estándar más alto. Guardamos el mínimo: nombre, edad y género del niño, nada más. Y todo queda auditado. Para el piloto trabajamos con datos ficticios a propósito: no movimos un solo dato real de un menor sin contrato y política de tratamiento firmados.");

  slidePregunta(p, "¿Y si algo falla el día del evento?",
    "Listados de respaldo impresos por carpa, con código, niño y juguete, para seguir entregando en papel y registrar después.\n\nEnsayo previo en sitio, con los dispositivos y la red reales del parque.\n\nAcompañamiento técnico durante toda la jornada.\n\nEl modo sin conexión del módulo de entrega es alcance de producción: hoy no está construido.",
    null,
    "No les voy a decir que nada puede fallar. Les digo qué hay preparado si falla. Y quiero ser explícito en lo último: el modo sin conexión NO está construido hoy, es alcance de producción. Si la red del parque se cae, se entrega con los listados impresos y se registra después. Prefiero decirlo acá que el 12 de diciembre.");

  slideCapturaTexto(p, "Trazabilidad completa", "Cada selección y cada entrega quedan registradas", R("rec-escritorio-12-acueducto-selecciones"), [
    "Qué eligió cada colaborador y cuándo",
    "Qué se entregó, a quién y en qué carpa",
    "Toda corrección exige motivo y queda registrada",
    "Exportable para auditoría interna",
  ], "Para una entidad pública esto suele ser lo más importante después de la protección de datos. Nada se puede corregir en silencio: liberar una selección o revertir una entrega exige escribir el motivo y queda con nombre y hora. Es exportable para su auditoría interna.");

  slideLista(p, "Quién está detrás", null, [
    { t: "Kidotoy", d: "Juguetes, catálogo, logística, carpas y entrega en sitio. Es el aliado que responde por el obsequio." },
    { t: "Plataforma", d: "Sebastián Grajales. Desarrollo, operación y acompañamiento durante la jornada." },
  ], "Una alianza con roles claros. Kidotoy responde por el juguete y por la operación en el parque, que es lo que ustedes van a ver el 12 de diciembre. Yo respondo por la plataforma y estoy en la jornada por si algo se necesita.");

  portada(p, "GRACIAS",
    "Quedamos atentos\na sus preguntas",
    "El sistema queda abierto para que lo prueben con su equipo el tiempo que necesiten.",
    "acueducto-kidotoy.vaisy.app")
    .addNotes("Gracias. El acceso queda abierto para que lo prueben con su equipo, sin límite de tiempo. Cualquier duda de tecnología la resuelvo yo directamente; lo comercial y logístico, con Kidotoy.");

  await p.writeFile({ fileName: `${OUT}/02-Acueducto-Propuesta.pptx` });
  console.log("✔ 02-Acueducto-Propuesta.pptx");
}

// ══════════════ 3 · INSTRUCTIVO COLABORADOR ══════════════
async function deck3(R, mk) {
  const p = nuevo("Cómo elegir el regalo de tus hijos", "Instructivo para colaboradores");

  portada(p, "PROGRAMA DE REGALOS DE FIN DE AÑO",
    "Cómo elegir el regalo\nde tus hijos",
    "Una guía de seis pasos. Te toma menos de cinco minutos desde el celular.",
    "Empresa de Acueducto y Alcantarillado de Bogotá · Regalos en alianza con Kidotoy")
    .addNotes("Portada del instructivo que se reparte a los colaboradores. Puede ir impreso o por correo interno.");

  slideLista(p, "Antes de empezar", "Ten a la mano estas dos cosas", [
    { t: "Tu número de cédula", d: "Sin puntos ni comas. Solo los números." },
    { t: "Tu código SAP", d: "Te lo envió Talento Humano en el correo del programa. Empieza por SAP-." },
  ], "Con eso basta. No hay que crear ninguna contraseña ni registrarse. Si no encuentras el código, escríbele a Talento Humano.");

  slideQR(p, "Paso 1 · Entra al portal",
    "Apunta la cámara de tu celular al código de la derecha. Si prefieres, escribe la dirección en tu navegador.",
    [], "El QR abre directamente el portal. También pueden escribir la dirección a mano.");

  slidePaso(p, 2, "Ingresa tus datos",
    "Escribe tu cédula en el primer campo y el código SAP en el segundo. Después toca Ingresar.",
    R("ins-01-login"),
    [{ n: 1, caja: mk["ins-01-login"].cedula }, { n: 2, caja: mk["ins-01-login"].sap }, { n: 3, caja: mk["ins-01-login"].boton }],
    null,
    "Los dos datos van tal como te los dieron. Si te sale un mensaje de que no coinciden, revisa que la cédula vaya sin puntos.");

  slidePaso(p, 3, "Ahí están tus hijos",
    "Aparece una tarjeta por cada hijo. Cada una lleva una etiqueta que dice cómo va:\n\n1.  La etiqueta dice «Regalo confirmado»: ya está listo, y abajo ves cuál quedó.\n2.  La etiqueta dice «Falta elegir»: todavía no le has escogido regalo.\n\nToca la tarjeta del hijo al que le vas a elegir.",
    R("ins-02-hijos"),
    [{ n: 1, caja: mk["ins-02-hijos"].confirmado }, { n: 2, caja: mk["ins-02-hijos"].pendiente }],
    null,
    "Aquí es donde la gente se queda tranquila: se ve de un vistazo qué falta y qué no. La tarjeta 1 ya tiene regalo; la 2 está pendiente.");

  slidePaso(p, 4, "Elige el regalo",
    "Vas a ver seis opciones, elegidas para la edad de ese hijo. Toca «Elegir este» en el que quieras.\n\nSi un juguete dice «Agotado», ya no quedan unidades y no se puede seleccionar. Escoge otro de la lista.",
    R("ins-03-catalogo"),
    [{ n: 1, caja: mk["ins-03-catalogo"].elegir }],
    null,
    "Las opciones cambian según la edad del niño, por eso cada hijo ve cosas distintas. Los agotados quedan bloqueados: no es un error.");

  slidePaso(p, 5, "Revisa y confirma",
    "Revisa que sea el juguete que quieres y toca «Confirmar regalo».",
    R("ins-04-confirmar"),
    [{ n: 1, caja: mk["ins-04-confirmar"].confirmar }],
    "IMPORTANTE: después de confirmar NO puedes cambiar el regalo por tu cuenta. Revisa bien antes de tocar el botón.",
    "Este es el paso donde hay que detenerse. La confirmación es definitiva para el colaborador. Si alguien se equivoca, tiene que pedirle el cambio a Talento Humano y no siempre va a ser posible.");

  slidePaso(p, 6, "Guarda tu código",
    "Listo. Aparece tu código de entrega y un código QR.\n\nGuárdalo: tómale una foto, tócalo en «Copiar código» o descárgalo. Lo vas a necesitar el día de la entrega.\n\nTambién te llega por correo cuando termines con todos tus hijos.",
    R("ins-05-comprobante"),
    [],
    null,
    "Insistir en que guarden el código. Aunque se puede volver a consultar entrando otra vez al portal, en la carpa es más rápido si ya lo tienen a la mano.");

  slideLista(p, "Repite con cada hijo", "Un regalo por cada uno", [
    { t: "Vuelve a «Mis beneficiarios»", d: "Toca «Mis beneficiarios» arriba a la izquierda." },
    { t: "Elige el siguiente hijo", d: "Repite los pasos 4, 5 y 6 con cada uno." },
    { t: "Cada hijo ve juguetes distintos", d: "Las opciones dependen de su edad. Es normal que no se parezcan." },
    { t: "Terminaste cuando ninguno diga «Falta elegir»", d: "Ahí te llega el correo con todos los códigos." },
  ], "Es el mismo procedimiento por cada hijo. Cuando ya ninguno diga 'falta elegir', quedó completo.");

  slideLista(p, "El día de la entrega", "Viernes 12 de diciembre · Parque Jaime Duque", [
    { t: "Lleva tu código", d: "En el celular o impreso. Uno por cada hijo." },
    { t: "Busca tu carpa", d: "En el punto de información te indican a cuál ir según el juguete." },
    { t: "Presenta el QR", d: "El operario lo escanea, verifica y te entrega el regalo." },
    { t: "El horario", d: "Talento Humano lo confirma antes del evento." },
  ], "Fecha y lugar confirmados. La hora la comunica Talento Humano más cerca del evento.");

  slideLista(p, "Preguntas frecuentes", null, [
    { t: "No me deja entrar", d: "Revisa la cédula sin puntos y el código tal cual te lo enviaron. Tras varios intentos fallidos el acceso se bloquea un rato por seguridad: espera 15 minutos." },
    { t: "Me equivoqué de juguete", d: "No se puede cambiar por tu cuenta. Escríbele a Talento Humano lo antes posible." },
    { t: "Se agotó el que quería", d: "Las unidades son limitadas y se asignan en orden de confirmación. Elige otro de los disponibles." },
    { t: "No aparece mi hijo", d: "La información la carga la empresa. Repórtalo a Talento Humano para que lo revisen." },
    { t: "Perdí mi código", d: "Vuelve a entrar al portal con tu cédula y tu código SAP: el comprobante sigue ahí." },
    { t: "¿Puedo elegir desde el computador?", d: "Sí. Funciona igual en computador, tableta o celular." },
  ], "Estas son las cinco que más van a llegar. La del bloqueo por intentos es importante: no está dañado, es una protección y se libera solo a los 15 minutos.");

  await p.writeFile({ fileName: `${OUT}/03-Instructivo-Colaborador.pptx` });
  console.log("✔ 03-Instructivo-Colaborador.pptx");
}

// ══════════════ 4 · INSTRUCTIVO OPERARIO ══════════════
async function deck4(C, R, mk) {
  const p = nuevo("Guía de entrega · 12 de diciembre", "Instructivo para operarios de Kidotoy");

  portada(p, "KIDOTOY · JORNADA DE ENTREGA",
    "Guía de entrega",
    "Viernes 12 de diciembre · Parque Jaime Duque\nLéela una vez antes de empezar. Tenla a la mano.",
    "Personal de carpa")
    .addNotes("Guía de capacitación para el personal de carpa. Se imprime y se deja en cada puesto.");

  slideLista(p, "Antes de empezar", "Dos minutos, una sola vez", [
    { t: "Entra con tu correo", d: "El que te dio Kidotoy, con tu contraseña. No compartas la sesión." },
    { t: "Verifica tu carpa", d: "Arriba en azul debe decir el nombre de TU carpa. Si dice otra, avisa antes de empezar." },
    { t: "Deja la sesión abierta", d: "No cierres sesión entre familia y familia. Solo toca «Nueva búsqueda»." },
    { t: "Batería y datos", d: "Empieza con el equipo cargado. Necesitas conexión para registrar." },
  ], "Lo más importante: que verifiquen que arriba diga su carpa. Si un operario trabaja con la carpa equivocada, los conteos del día no cuadran.");

  slidePaso(p, 1, "Escanea o busca",
    "Toca «Escanear QR» y apunta al comprobante del papá.\n\nSi el QR no lee —pantalla rota, poca luz, papel arrugado— escribe abajo el código de entrega o la cédula del papá y toca «Buscar».",
    R("ins-op-01-buscar"),
    [{ n: 1, caja: mk["ins-op-01-buscar"].escanear }, { n: 2, caja: mk["ins-op-01-buscar"].campo }],
    null,
    "El escáner es lo rápido, pero siempre hay un plan B. Buscar por cédula sirve cuando el papá llegó sin el comprobante.");

  slidePaso(p, 2, "Verifica antes de entregar",
    "Antes de tocar nada, revisa las tres cosas marcadas en la pantalla:\n\n1.  El nombre del niño. Dilo en voz alta y que la familia lo confirme.\n2.  La carpa donde se despacha ese juguete.\n3.  El juguete asignado.\n\nSi todo cuadra, búscalo en tu carpa y entrégalo.",
    R("ins-op-02-ficha"),
    [
      { n: 1, caja: mk["ins-op-02-ficha"].nombre },
      { n: 2, caja: mk["ins-op-02-ficha"].carpa },
      { n: 3, caja: mk["ins-op-02-ficha"].juguete },
    ],
    null,
    "Que verifiquen SIEMPRE el nombre del niño en voz alta con el papá. Es el chequeo que evita entregar el juguete equivocado. El botón verde de marcar está más abajo en esa misma pantalla: ese es el paso 3, todavía no.");

  slidePaso(p, 3, "Entrega y marca",
    "Entrega primero el juguete. Después, al final de esa misma ficha, toca el botón verde «Marcar entregado».\n\nQuedó registrado cuando ves esta pantalla: verde de lado a lado, con el nombre del niño y su juguete. Toca «Siguiente» y atiende a la próxima familia.",
    C("movil-07-entrega-entregado"),
    [],
    "El orden importa: PRIMERO entregas, DESPUÉS marcas. Si marcas antes y la familia se va sin el regalo, el sistema dice que se entregó y nadie lo va a notar.",
    "Verde es adelante. Y el orden importa: primero entregan el juguete, después marcan. Si marcan antes y la familia se va sin el regalo, el sistema dice que se entregó y nadie lo va a notar.");

  slideCapturaTexto(p, "Si sale pantalla ROJA", "«Ya fue entregado»", R("ins-op-03-ya-entregado"), [
    "Ese regalo ya se entregó antes",
    "La pantalla te dice cuándo se entregó y con qué cuenta",
    "NO entregues un segundo juguete",
    "Explica con calma y llama al coordinador",
  ], "Rojo es alto. Puede ser que otro familiar ya pasó a reclamarlo, o un error. No es el operario quien lo resuelve: llama al coordinador y sigue atendiendo la fila.");

  slideCapturaTexto(p, "Si dice OTRA CARPA", "Puedes entregarlo igual", R("ins-op-04-otra-carpa"), [
    "Si tienes ese juguete en tu carpa, entrégalo",
    "No devuelvas a la familia a hacer otra fila",
    "El sistema lo registra como entrega fuera de carpa",
    "El conteo se cuadra después, no en el momento",
  ], "Esto es a propósito. La familia ya está enfrente: si tenemos el juguete, se entrega. El sistema lo marca como fuera de carpa y el conteo se cuadra al cierre. La regla es no devolver a nadie a otra fila.");

  slideLista(p, "Si algo falla", "Qué hacer y a quién llamar", [
    { t: "No hay señal", d: "No se puede registrar sin conexión. Usa el listado impreso de tu carpa, anota el código y avisa al coordinador." },
    { t: "El código no existe", d: "Verifica que esté bien escrito. Si sigue igual, al coordinador." },
    { t: "El papá no trae comprobante", d: "Busca por su número de cédula." },
    { t: "Se acabó el juguete en tu carpa", d: "Avisa al coordinador antes de decirle nada a la familia." },
    { t: "El equipo se apaga o se traba", d: "Vuelve a entrar con tu correo. Lo que ya marcaste quedó guardado." },
    { t: "Coordinador de jornada", d: "Kidotoy confirma el número el día del evento." },
  ], "El primer punto es el crítico: hoy el sistema NO funciona sin conexión. Si se cae la red, se entrega con el listado impreso y se registra después. Por eso cada carpa tiene su listado en papel.", ROJO);

  await p.writeFile({ fileName: `${OUT}/04-Instructivo-Operario.pptx` });
  console.log("✔ 04-Instructivo-Operario.pptx");
}

// ---- Punto de entrada -------------------------------------------------
import { readFileSync } from "node:fs";
const marcas = JSON.parse(readFileSync(`${REC}/marcas.json`, "utf8"));
await construir(marcas);
console.log("\nCuatro presentaciones en", OUT);
