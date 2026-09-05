/**
 * Ciñe el `viewBox` de las siluetas de beneficiario al dibujo real.
 *
 * Los archivos vienen en un lienzo cuadrado de 2048×2048 con el dibujo centrado
 * y márgenes generosos. En la tarjeta la silueta tiene que ir pegada a la
 * izquierda, ocupar casi todo el alto y salirse por abajo: con el lienzo
 * cuadrado eso obliga a compensar los márgenes a mano con porcentajes que se
 * rompen en cuanto cambia la proporción de la tarjeta. Con el viewBox ceñido,
 * la caja del SVG ES el dibujo y basta con posicionar esa caja.
 *
 * Es idempotente: si el viewBox ya está ceñido, no cambia nada. Se ejecuta a
 * mano cuando llegan siluetas nuevas: `node scripts/ajustar-siluetas.mjs`.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const MUESTRA = 1000; // resolución del rasterizado para medir
const ARCHIVOS = ["silueta-nino", "silueta-nina"];

for (const nombre of ARCHIVOS) {
  const ruta = `public/siluetas/${nombre}.svg`;
  const original = readFileSync(ruta, "utf8");
  const vb = original.match(/viewBox="([\d.\s-]+)"/);
  if (!vb) {
    console.log(`${nombre}: sin viewBox, se omite`);
    continue;
  }
  const [vx, vy, vw, vh] = vb[1].trim().split(/\s+/).map(Number);

  // Se mide sobre el SVG sin metadatos (el manifiesto C2PA no afecta al dibujo
  // pero sí al peso del rasterizado).
  const limpio = original.replace(/<metadata>[\s\S]*?<\/metadata>/, "");
  const { data } = await sharp(Buffer.from(limpio), { density: 150 })
    .resize(MUESTRA, MUESTRA, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let y = 0; y < MUESTRA; y++) {
    for (let x = 0; x < MUESTRA; x++) {
      if (data[(y * MUESTRA + x) * 4 + 3] > 40) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) {
    console.log(`${nombre}: dibujo vacío, se omite`);
    continue;
  }

  const r = (v) => Math.round(v * 100) / 100;
  const nuevo = [
    r(vx + (x0 / MUESTRA) * vw),
    r(vy + (y0 / MUESTRA) * vh),
    r(((x1 - x0 + 1) / MUESTRA) * vw),
    r(((y1 - y0 + 1) / MUESTRA) * vh),
  ];
  writeFileSync(ruta, original.replace(vb[0], `viewBox="${nuevo.join(" ")}"`));
  console.log(
    `${nombre}: ${vb[1]} -> ${nuevo.join(" ")} (proporción ${r(nuevo[2] / nuevo[3])})`,
  );
}
