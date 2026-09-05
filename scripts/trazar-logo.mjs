/**
 * Vectoriza el logotipo del Acueducto (PNG 500x124, línea fina) a un SVG de una
 * sola ruta con `currentColor`, para poder pintarlo BLANCO sin filtros CSS.
 *
 * Por qué existe: el PNG es de baja resolución y `filter: brightness(0) invert(1)`
 * lo dejaba lavado sobre el panel azul. Además el mockup usa el lockup SIN la
 * bajada "Agua y alcantarillado de Bogotá": aquí se separa por COLOR (la rana y
 * la palabra son cian #1F8DCD; la bajada es casi negra), así que el trazado toma
 * solo el cian.
 *
 * Se ejecuta a mano: `node scripts/trazar-logo.mjs`. Cuando llegue el vectorial
 * oficial, se reemplaza el archivo y este script deja de hacer falta.
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const ORIGEN = "public/logos/acueducto.png";
const DESTINO = "public/logos/acueducto-marca.svg";
const ESCALA = 6; // se traza a 6x para que los contornos salgan suaves
const EPSILON = 1.6; // simplificación RDP, en píxeles de la malla ampliada

const meta = await sharp(ORIGEN).metadata();
const W = meta.width * ESCALA;
const H = meta.height * ESCALA;

const { data } = await sharp(ORIGEN)
  .ensureAlpha()
  .resize(W, H, { kernel: "lanczos3" })
  .raw()
  .toBuffer({ resolveWithObject: true });

// Máscara: píxel con alfa suficiente y color CIAN (no la bajada negra).
const dentro = new Uint8Array(W * H);
for (let i = 0, p = 0; i < data.length; i += 4, p++) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 110) continue;
  const cian = b > 110 && b > r + 40 && g > r + 20;
  if (cian) dentro[p] = 1;
}
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : dentro[y * W + x]);

// ---- Marching squares: segmentos dirigidos con el relleno SIEMPRE a la izquierda.
const segs = new Map(); // "x,y" del inicio -> [fin]
const k = (p) => `${p[0]},${p[1]}`;
const push = (a, b) => {
  const key = k(a);
  if (!segs.has(key)) segs.set(key, []);
  segs.get(key).push(b);
};
for (let y = -1; y < H; y++) {
  for (let x = -1; x < W; x++) {
    const tl = at(x, y), tr = at(x + 1, y), br = at(x + 1, y + 1), bl = at(x, y + 1);
    const c = (tl << 3) | (tr << 2) | (br << 1) | bl;
    if (c === 0 || c === 15) continue;
    const T = [x + 0.5, y], R = [x + 1, y + 0.5], B = [x + 0.5, y + 1], L = [x, y + 0.5];
    switch (c) {
      case 1: push(B, L); break;
      case 2: push(R, B); break;
      case 3: push(R, L); break;
      case 4: push(T, R); break;
      case 5: push(T, L); push(B, R); break; // silla: centro lleno
      case 6: push(T, B); break;
      case 7: push(T, L); break;
      case 8: push(L, T); break;
      case 9: push(B, T); break;
      case 10: push(R, T); push(L, B); break; // silla: centro lleno
      case 11: push(R, T); break;
      case 12: push(L, R); break;
      case 13: push(B, R); break;
      case 14: push(L, B); break;
    }
  }
}

// ---- Encadenar los segmentos en contornos cerrados.
const contornos = [];
for (const [inicio] of segs) {
  while (segs.get(inicio)?.length) {
    const pts = [inicio.split(",").map(Number)];
    let actual = inicio;
    for (;;) {
      const salidas = segs.get(actual);
      if (!salidas?.length) break;
      const sig = salidas.pop();
      if (!salidas.length) segs.delete(actual);
      pts.push(sig);
      actual = k(sig);
      if (actual === inicio) break;
    }
    if (pts.length > 8) contornos.push(pts);
  }
}

// ---- Simplificación Ramer–Douglas–Peucker.
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let maxD = 0, idx = 0;
  const [x1, y1] = pts[0], [x2, y2] = pts[pts.length - 1];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * (pts[i][0] - x1) - dx * (pts[i][1] - y1)) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD <= eps) return [pts[0], pts[pts.length - 1]];
  return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
}

/**
 * RDP sobre un contorno CERRADO. Aplicarlo directo lo aplasta: el primer punto y
 * el último coinciden, la "recta" de referencia mide cero y todas las distancias
 * dan 0. Se parte primero por el punto más lejano del inicio y se simplifica cada
 * mitad por separado.
 */
function rdpCerrado(pts, eps) {
  const p = pts[pts.length - 1] === pts[0] ? pts.slice(0, -1) : pts;
  if (p.length < 4) return [...p, p[0]];
  let idx = 0, maxD = -1;
  for (let i = 1; i < p.length; i++) {
    const d = Math.hypot(p[i][0] - p[0][0], p[i][1] - p[0][1]);
    if (d > maxD) { maxD = d; idx = i; }
  }
  const a = rdp(p.slice(0, idx + 1), eps);
  const b = rdp([...p.slice(idx), p[0]], eps);
  return [...a.slice(0, -1), ...b];
}

// ---- Catmull-Rom cerrado -> cúbicas de Bézier (contorno suave, sin facetas).
const n2 = (v) => Math.round((v / ESCALA) * 100) / 100;
function aRuta(pts) {
  const p = pts.slice(0, -1); // el último repite el primero
  const m = p.length;
  if (m < 3) return "";
  let d = `M${n2(p[0][0])} ${n2(p[0][1])}`;
  for (let i = 0; i < m; i++) {
    const p0 = p[(i - 1 + m) % m], p1 = p[i], p2 = p[(i + 1) % m], p3 = p[(i + 2) % m];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n2(c1[0])} ${n2(c1[1])} ${n2(c2[0])} ${n2(c2[1])} ${n2(p2[0])} ${n2(p2[1])}`;
  }
  return d + "Z";
}

// ---- Bounding box de un contorno ya simplificado (en unidades del PNG).
const caja = (pts) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) {
    const u = x / ESCALA, v = y / ESCALA;
    if (u < x0) x0 = u;
    if (u > x1) x1 = u;
    if (v < y0) y0 = v;
    if (v > y1) y1 = v;
  }
  return { x0, y0, x1, y1 };
};

const piezas = contornos.map((c) => {
  const pts = rdpCerrado(c, EPSILON);
  return { d: aRuta(pts), ...caja(pts) };
}).filter((p) => p.d);

const svg = (vb, cuerpo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}" fill="currentColor" fill-rule="evenodd">${cuerpo}</svg>
`;
const r2 = (v) => Math.round(v * 100) / 100;
const M = 0.5; // margen para que el trazo no quede al ras del viewBox

// ---- 1) Lockup horizontal (rana + palabra), tal como viene el PNG.
const total = piezas.reduce(
  (a, p) => ({ x0: Math.min(a.x0, p.x0), y0: Math.min(a.y0, p.y0), x1: Math.max(a.x1, p.x1), y1: Math.max(a.y1, p.y1) }),
  { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity },
);
const vbH = [total.x0 - M, total.y0 - M, total.x1 - total.x0 + 2 * M, total.y1 - total.y0 + 2 * M].map(r2);
writeFileSync(DESTINO, svg(vbH, `<path d="${piezas.map((p) => p.d).join("")}"/>`));

// ---- 2) Lockup APILADO (rana centrada sobre la palabra), que es el que usa la
// propuesta del cliente en el panel del login. Se parte por el hueco horizontal
// más ancho entre contornos: a la izquierda la rana, a la derecha "acueducto".
const ordenadas = [...piezas].sort((a, b) => a.x0 - b.x0);
let corte = 0, hueco = 0, borde = ordenadas[0].x1;
for (const p of ordenadas.slice(1)) {
  if (p.x0 - borde > hueco) { hueco = p.x0 - borde; corte = p.x0; }
  borde = Math.max(borde, p.x1);
}
const caja2 = (ps) => ps.reduce(
  (a, p) => ({ x0: Math.min(a.x0, p.x0), y0: Math.min(a.y0, p.y0), x1: Math.max(a.x1, p.x1), y1: Math.max(a.y1, p.y1) }),
  { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity },
);
const rana = piezas.filter((p) => p.x0 < corte);
const palabra = piezas.filter((p) => p.x0 >= corte);
const cR = caja2(rana), cP = caja2(palabra);
// En el lockup apilado la rana pesa mucho más que en el horizontal: medida
// sobre la propuesta del cliente, su ancho es ~0.83 del de la palabra.
const anchoPalabra = cP.x1 - cP.x0;
const K = (anchoPalabra * 0.83) / (cR.x1 - cR.x0);
const SEPARACION = anchoPalabra * 0.05;
const anchoRana = (cR.x1 - cR.x0) * K, altoRana = (cR.y1 - cR.y0) * K;
const ancho = Math.max(anchoRana, anchoPalabra);
const alto = altoRana + SEPARACION + (cP.y1 - cP.y0);
// Traslada (y escala la rana): rana arriba centrada, palabra debajo centrada.
const mover = (grupo, c, dy, k = 1) =>
  `<g transform="translate(${r2((ancho - (c.x1 - c.x0) * k) / 2)} ${r2(dy)}) scale(${r2(k)}) translate(${r2(-c.x0)} ${r2(-c.y0)})"><path d="${grupo.map((p) => p.d).join("")}"/></g>`;
const cuerpo =
  mover(rana, cR, 0, K) +
  mover(palabra, cP, altoRana + SEPARACION);
writeFileSync(
  "public/logos/acueducto-marca-apilada.svg",
  svg([-M, -M, r2(ancho + 2 * M), r2(alto + 2 * M)], cuerpo),
);

console.log(`horizontal: viewBox ${vbH.join(" ")} proporcion ${r2(vbH[2] / vbH[3])}`);
console.log(`apilada:    ${r2(ancho + 2 * M)}x${r2(alto + 2 * M)} proporcion ${r2((ancho + 2 * M) / (alto + 2 * M))} (rana ${rana.length} contornos, palabra ${palabra.length})`);
