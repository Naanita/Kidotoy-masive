// USO LOCAL, no es una ruta de la aplicación. Captura las secciones de /kidotoy y
// MIDE en el navegador la caja de cada bloque que el manual va a marcar.
// Nada se mide a ojo. Solo NAVEGA y LEE: no crea, edita ni libera nada.
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const SITIO = "https://acueducto-kidotoy.vaisy.app";
const REC = "docs/presentacion/recursos/kidotoy";
mkdirSync(REC, { recursive: true });
// La clave sale del entorno, nunca del archivo. Es la del seed (scripts/setup-auth.mjs).
//   PowerShell:  $env:KIDOTOY_ADMIN_PASS = "..."
const ADMIN = { correo: process.env.KIDOTOY_ADMIN_CORREO ?? "admin@kidotoy.local", clave: process.env.KIDOTOY_ADMIN_PASS };
if (!ADMIN.clave) throw new Error("Falta la variable de entorno KIDOTOY_ADMIN_PASS.");

// Por sección: las vistas (desplazamiento en píxeles) y qué bloques marcar en
// cada una. El texto es el del encabezado o del control tal como aparece.
const PLAN = [
  { id: "resumen", ruta: "/kidotoy/panel", vistas: [
      { sufijo: "a", scroll: 0, bloques: ["¿Cuánto falta?", "Evolución de la campaña", "¿Qué se agota?", "¿Quiénes no han entrado?"] },
    ] },
  { id: "selecciones", ruta: "/kidotoy/selecciones", vistas: [
      { sufijo: "a", scroll: 0, bloques: ["Buscar nombre", "@filtros", "Exportar CSV", "@tabla", "Liberar"] },
    ] },
  { id: "inventario", ruta: "/kidotoy/inventario", vistas: [
      { sufijo: "a", scroll: 0, bloques: ["Cobertura por edad y género", "Detalle del grupo"] },
      { sufijo: "b", scroll: 900, bloques: ["Referencias", "Stock"] },
    ] },
  { id: "entregas", ruta: "/kidotoy/entregas", vistas: [
      { sufijo: "a", scroll: 0, bloques: ["Jornada de entrega", "Avance por carpa"] },
      { sufijo: "b", scroll: 430, bloques: ["Últimas entregas", "Buscar y revertir una entrega"] },
    ] },
  { id: "carpas", ruta: "/kidotoy/carpas", vistas: [
      { sufijo: "a", scroll: 0, bloques: ["Carpas del evento", "Nombre de la carpa", "Agregar"] },
      { sufijo: "b", scroll: 620, bloques: ["Referencias por carpa", "@tabla"] },
    ] },
  { id: "operarios", ruta: "/kidotoy/operarios", vistas: [
      { sufijo: "a", scroll: 0, bloques: ["Nuevo operario", "@tabla"] },
    ] },
  { id: "catalogo", ruta: "/kidotoy/catalogo", vistas: [
      { sufijo: "a", scroll: 0, bloques: ["Nueva referencia", "@tabla", "Editar"] },
    ] },
];

const nav = await chromium.launch();
const perfil = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };

// El login va en su propio contexto, sin sesión.
const ctxAnon = await nav.newContext(perfil);
const pAnon = await ctxAnon.newPage();
await pAnon.goto(`${SITIO}/kidotoy`, { waitUntil: "networkidle" });
await pAnon.screenshot({ path: `${REC}/kid-login.png` });
await ctxAnon.close();

const ctx = await nav.newContext(perfil);
const page = await ctx.newPage();
await page.goto(`${SITIO}/kidotoy`, { waitUntil: "networkidle" });
await page.getByLabel(/correo/i).fill(ADMIN.correo);
await page.getByLabel(/contrase/i).fill(ADMIN.clave);
await page.getByRole("button", { name: /^Entrar$/i }).click();
await page.waitForURL(/\/kidotoy\/panel/, { timeout: 20000 });

const medidas = {};
for (const sec of PLAN) {
  await page.goto(SITIO + sec.ruta, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  for (const vista of sec.vistas) {
    await page.evaluate((y) => window.scrollTo(0, y), vista.scroll);
    await page.waitForTimeout(700);
    const nombre = `kid-${sec.id}-${vista.sufijo}`;
    await page.screenshot({ path: `${REC}/${nombre}.png` });

    medidas[nombre] = await page.evaluate((bloques) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const frac = (r) => ({
        x: +(r.left / vw).toFixed(4), y: +(r.top / vh).toFixed(4),
        w: +(r.width / vw).toFixed(4), h: +(r.height / vh).toFixed(4),
      });
      const main = document.querySelector("main") || document.body;
      // Sube desde el encabezado hasta la TARJETA que lo contiene: el primer
      // ancestro con esquinas redondeadas y borde o fondo propio. Subir por
      // ancho no sirve: la columna de contenido mide lo mismo que la página.
      const tarjeta = (el) => {
        let n = el;
        for (let i = 0; i < 7 && n.parentElement && n.parentElement !== main; i++) {
          n = n.parentElement;
          const cs = getComputedStyle(n);
          const redondeado = parseFloat(cs.borderTopLeftRadius) > 2;
          const conBorde = parseFloat(cs.borderTopWidth) > 0;
          const conFondo = cs.backgroundColor && !/rgba?\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
          if (redondeado && (conBorde || conFondo)) return n;
        }
        return el;
      };
      const salida = {};
      for (const b of bloques) {
        let el = null;
        if (b === "@tabla") {
          const t = main.querySelector("table");
          if (t) {
            const r = t.getBoundingClientRect();
            salida[b] = frac({ left: r.left, top: r.top, width: r.width,
                               height: Math.min(r.height, vh - 26 - r.top) });
            continue;
          }
        }
        else if (b === "@filtros") {
          const sels = [...main.querySelectorAll("select, [role=combobox], button")].filter((s) => {
            const t = (s.textContent || "").trim();
            return /^Toda |^Todo /.test(t);
          });
          if (sels.length) {
            const rs = sels.map((s) => s.getBoundingClientRect());
            const r = {
              left: Math.min(...rs.map((r) => r.left)), top: Math.min(...rs.map((r) => r.top)),
              right: Math.max(...rs.map((r) => r.right)), bottom: Math.max(...rs.map((r) => r.bottom)),
            };
            salida[b] = frac({ left: r.left, top: r.top, width: r.right - r.left, height: r.bottom - r.top });
            continue;
          }
        } else {
          const objetivo = b.toLowerCase();
          // 1) Un control cuyo texto ES el buscado: se marca el control tal cual.
          const control = [...main.querySelectorAll("button, a[href], input")].find((n) => {
            const t = (n.textContent || n.getAttribute("placeholder") || "").trim().toLowerCase();
            return t === objetivo || t.startsWith(objetivo);
          });
          if (control) { salida[b] = frac(control.getBoundingClientRect()); continue; }
          // 2) Si no, un encabezado: se marca la tarjeta que lo contiene.
          const cand = [...main.querySelectorAll("h1,h2,h3,h4,p,span")].filter((n) => {
            const t = (n.textContent || "").trim();
            return t.toLowerCase().startsWith(objetivo) && t.length < b.length + 12;
          });
          el = cand.sort((a, c) => a.textContent.length - c.textContent.length)[0] || null;
          if (el) {
            const t = tarjeta(el);
            if (t !== el) { salida[b] = frac(t.getBoundingClientRect()); continue; }
            // Encabezado suelto: la marca cubre desde el título hasta el
            // siguiente encabezado, para señalar el bloque y no solo la línea.
            const r = el.getBoundingClientRect();
            // Ancho de la COLUMNA de contenido, no el del título: un encabezado
            // corto dejaba la marca cubriendo solo media rejilla.
            // Columna de contenido de la página (la del h1), no el padre del
            // encabezado: ese podía ser solo la mitad izquierda de la rejilla.
            const h1 = main.querySelector("h1");
            const col = (h1?.parentElement ?? el.parentElement ?? main).getBoundingClientRect();
            const enc = [...main.querySelectorAll("h1,h2,h3,h4")];
            const sig = enc.find((n) => n.getBoundingClientRect().top > r.bottom + 4);
            // Se deja aire hasta el borde inferior de la captura: pegada al corte,
            // la marca parece cortada en vez de "sigue más abajo".
            const fin = Math.min(sig ? sig.getBoundingClientRect().top - 10 : vh - 26, vh - 26);
            salida[b] = frac({
              left: Math.min(r.left, col.left), top: r.top,
              width: Math.max(r.width, col.width), height: Math.max(r.height, fin - r.top),
            });
            continue;
          }
        }
        if (!el) { salida[b] = null; continue; }
        salida[b] = frac(el.getBoundingClientRect());
      }
      return salida;
    }, vista.bloques);

    const faltan = Object.entries(medidas[nombre]).filter(([, v]) => !v).map(([k]) => k);
    console.log(`✔ ${nombre}${faltan.length ? "  ✖ sin medir: " + faltan.join(", ") : ""}`);
  }
}
writeFileSync(`${REC}/medidas.json`, JSON.stringify(medidas, null, 2));
await nav.close();
console.log("\nMedidas en", `${REC}/medidas.json`);
