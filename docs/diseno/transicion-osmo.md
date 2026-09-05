# Transición de página — referencia de Osmo y cómo se adaptó

Referencia entregada por el cliente para la transición del login del colaborador a
"Mis beneficiarios". El original de Osmo traza un `<path>` SVG con DrawSVG hasta cubrir la
pantalla y luego lo retira por el otro lado.

---

## Qué se tomó y qué no

| Pieza del ejemplo | Aquí |
|---|---|
| **GSAP** | Sí. `gsap` del paquete público de npm. |
| **DrawSVGPlugin** | Sí. Desde 3.13 todos los plugins son gratuitos, uso comercial incluido. **No hay registro privado de GreenSock ni token de autenticación**: esa instrucción está desactualizada. |
| **CustomEase** | Sí, para la curva `osmo` (`0.625, 0.05, 0, 1`). |
| **Barba.js** | **No.** Barba intercepta la navegación de un sitio multipágina clásico. Aquí hay Next.js App Router: la navegación ya es de cliente y el layout persiste entre rutas, que es exactamente lo que Barba emula. |
| **Lenis** | **No.** Es scroll suave. Este producto es de formularios cortos, no de recorrido largo. |
| **ScrollTrigger** | **No.** No hay nada guiado por scroll. |
| Sistema general de transiciones (hooks `once`/`leave`/`enter` para todas las rutas) | **No.** Es UNA transición en UN punto. |

Instalación:

```bash
npm install gsap
```

```ts
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
```

---

## Dónde va y dónde no

**Sí:** login del colaborador (`/`) → "Mis beneficiarios" (`/inicio`). Es el momento de
bienvenida y ahí la animación cuenta algo.

**No:** catálogo, confirmación, comprobante, panel de Kidotoy, portal del Acueducto y
módulo de entrega. Ahí la gente está trabajando y un segundo entre pantallas se vuelve
insoportable a la tercera vez. En el módulo de entrega sería directamente un problema de
producto: son cientos de operaciones en una jornada.

---

## Cómo se resolvió en Next.js

1. **`ProveedorTransicion`** (`components/transicion/proveedor-transicion.tsx`), cliente,
   montado en `app/(colaborador)/layout.tsx`. Ese layout persiste entre `/` y `/inicio`,
   así que la capa animada sobrevive a la navegación. La capa es `position: fixed`,
   `z-50` y **`pointer-events-none` siempre**.

2. **La acción del servidor del login ya no redirige.** `accederColaborador()` devuelve
   `{ ok: true }` y el cliente dispara la salida; cuando el trazo termina de cubrir,
   `router.push()`.

3. **`FinTransicion`** se renderiza **dentro de la página** `/inicio` —no en un
   `template.tsx`— y avisa que el destino montó; ahí se reproduce la entrada. El template
   se renderiza por fuera del límite de Suspense de `loading.tsx` y habría descubierto un
   esqueleto.

4. **Prefetch** de `/inicio` al empezar la salida, no antes: sin sesión esa ruta responde
   con el redirect del middleware y el prefetch no serviría de nada.

---

## Requisitos que no se negocian

- `prefers-reduced-motion: reduce` → navegación directa, sin animación.
- **Si algo falla, la navegación ocurre igual.** Temporizador de seguridad de 900 ms: si el
  destino nunca avisa que montó, la capa se retira sola. Nadie puede quedar atrapado bajo
  una pantalla tapada.
- **Duración total ≤ 1.2 s.** Presupuesto: 0.42 s cubrir + 0.55 s descubrir ≈ 0.97 s de
  animación. El ejemplo de Osmo pasa de 2 s, que es lo correcto para un portafolio.
- Color del trazo desde tokens: `text-kido-turquesa`. El morado del ejemplo no es de marca,
  y el azul del Acueducto se perdería contra el propio panel azul del login.
- Se anima `stroke-dasharray`/`stroke-dashoffset` (DrawSVG), `stroke-width` y `opacity`;
  ninguna propiedad de layout.
- Sin capas fijas que queden capturando clics: `pointer-events-none` + `autoAlpha: 0` al
  terminar.

---

## Código original de referencia (Osmo)

Solo la parte de la transición; el andamiaje de Barba/Lenis del boilerplate no se replicó.

### HTML

```html
<div data-transition-wrap class="transition">
  <div class="transition__shape">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewbox="0 0 1000 1000" fill="none" preserveaspectratio="none" class="transition__svg">
      <path d="M43 259C296 11.5688 994 -3 922.994 498.259C851.988 999.517 281.229 1004.28 123 767C-35.2287 529.721 179 259 472 259C765 259 792 498.259 659 654C526 809.741 319 755 285 669.001C251 583.001 299 452 496 452C693 452 876.073 639.171 935 937.001" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  </div>
</div>
```

### CSS

```css
.transition { z-index: 25; pointer-events: none; position: fixed; inset: 0; overflow: clip; }
.transition__shape { color: #ceaeff; width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
.transition__svg { width: 130%; height: 130%; position: absolute; top: -15%; left: -15%; }
```

### JavaScript

```js
gsap.registerPlugin(DrawSVGPlugin);

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionSVGPath = transitionWrap.querySelectorAll("svg path");
  const tl = gsap.timeline({ onComplete: () => { current.remove() } });

  if (reducedMotion) return tl.set(current, { autoAlpha: 0 });

  tl.set(next, { autoAlpha: 0 }, 0);
  tl.set(transitionSVGPath, { strokeWidth: "5%", drawSVG: "0% 0%" });
  tl.to(transitionSVGPath, { duration: 1, drawSVG: "0% 85%", ease: "Power1.easeInOut" });
  tl.to(transitionSVGPath, { strokeWidth: "30%", duration: 0.75, ease: "Power1.easeInOut" }, "< 0.25");

  return tl;
}

function runPageEnterAnimation(next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionSVGPath = transitionWrap.querySelectorAll("svg path");
  const tl = gsap.timeline();

  if (reducedMotion) { /* swap inmediato */ }

  tl.add("startEnter", 1);
  tl.set(next, { autoAlpha: 1 }, "startEnter");
  tl.set(transitionSVGPath, { drawSVG: "0% 100%" });
  tl.to(transitionSVGPath, { duration: 1.25, drawSVG: "100% 100%", strokeWidth: "5%", ease: "Power1.easeInOut" }, "startEnter");
  tl.fromTo(next.querySelector("h1"), { yPercent: 25, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: "expo.out", duration: 1 }, "< 0.75");

  return tl;
}
```

### Cómo funciona

Un solo `<path>` que se dibuja a lo largo de la pantalla. Al salir arranca en 0% y avanza
mientras el grosor del trazo crece; al engordar, la línea se expande lo suficiente para
tapar el viewport entero. Al entrar, el trazo sigue en la misma dirección hasta 100% y sale
por el lado contrario mientras el grosor vuelve a su valor fino.

---

## Diferencias de tiempo respecto al original

| | Osmo | Aquí |
|---|---|---|
| Cubrir (draw) | 1.00 s | 0.42 s |
| Engordar trazo | 0.75 s | 0.36 s |
| Espera antes de descubrir | 1.00 s fija | hasta que monte el destino (tope 0.9 s) |
| Descubrir | 1.25 s | 0.55 s |
| Entrada del título | 1.00 s | 0.45 s |
| Grosor máximo | 30% | 34% (compensa el recorrido más corto) |
