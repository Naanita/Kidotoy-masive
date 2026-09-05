"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

import { ATRIBUTO_TITULO } from "./constantes";

/**
 * Transición de bienvenida: del login del colaborador a "Mis beneficiarios".
 *
 * Un trazo turquesa se dibuja y engorda hasta tapar la pantalla, se navega
 * debajo, y al llegar el trazo sigue de largo y adelgaza mientras el saludo
 * entra desde abajo. Adaptado de la transición de Osmo (ver
 * `docs/diseno/transicion-osmo.md`), SIN Barba ni Lenis: aquí no hay sitio
 * multipágina que interceptar ni recorrido largo que suavizar.
 *
 * ES UNA SOLA TRANSICIÓN, EN UN SOLO PUNTO. No es un sistema general. En el
 * catálogo, la confirmación, el comprobante, el panel de Kidotoy o el módulo de
 * entrega NO va: ahí la gente está trabajando y un segundo entre pantallas se
 * vuelve insoportable a la tercera vez (en la carpa de entrega serían cientos
 * de operaciones en una jornada).
 *
 * Reglas duras:
 *  - `prefers-reduced-motion` → navegación directa, sin animación.
 *  - La navegación ocurre SIEMPRE, pase lo que pase con la animación. Si la
 *    página destino nunca avisa que montó, un temporizador retira la capa igual:
 *    nadie puede quedarse atrapado bajo una pantalla tapada.
 *  - La capa es `pointer-events-none` siempre, y además se oculta al terminar.
 *
 * GSAP se carga DIFERIDO. Importado de forma estática sumaba ~33 kB al primer
 * JS del login, que es la pantalla más sensible del producto: la mayoría entra
 * desde el celular. Se pide al montar, en segundo plano, y para cuando alguien
 * termina de teclear cédula y código SAP ya está. Si por lo que sea no llegó,
 * el login navega sin animación en vez de esperarla.
 */

// Presupuesto de tiempo: ~0.95 s de animación. El ejemplo de Osmo pasa de 2 s,
// que es lo correcto para un portafolio y demasiado para alguien que solo
// quiere ver los regalos de sus hijos.
const D_CUBRIR = 0.4;
const D_DESCUBRIR = 0.48;
const D_TITULO = 0.42;
/**
 * RED DE SEGURIDAD, no parte del presupuesto. Lo normal es que la página
 * destino avise que montó (`FinTransicion`) a los pocos milisegundos: se navega
 * con `prefetch`, así que el payload ya está en caché y el `push` es inmediato.
 * Total normal: 0.40 + ~0.05 + 0.48 ≈ 0.93 s, dentro del tope de 1.2 s.
 *
 * Este temporizador solo existe para que nadie quede atrapado bajo la capa si
 * el destino nunca monta. Es LARGO a propósito: descubrir a los 250 ms —como
 * estaba— destapaba el propio login antes de que la navegación aterrizara, y
 * eso se lee como "no pasó nada", que es peor que un segundo de más. Si se
 * agota, se descubre pase lo que pase.
 */
const ESPERA_MAXIMA_MS = 2500;

const TRAZO_FINO = "5%";
const TRAZO_GRUESO = "34%";

// Trazo de la referencia de Osmo: una sola curva que recorre todo el lienzo.
const RUTA =
  "M43 259C296 11.5688 994 -3 922.994 498.259C851.988 999.517 281.229 1004.28 123 767C-35.2287 529.721 179 259 472 259C765 259 792 498.259 659 654C526 809.741 319 755 285 669.001C251 583.001 299 452 496 452C693 452 876.073 639.171 935 937.001";

type Gsap = typeof import("gsap").default;
type Linea = ReturnType<Gsap["timeline"]>;
type Estado = "inactivo" | "cubriendo" | "cubierto";

interface Transicion {
  /** Tapa la pantalla y navega a `destino` cuando termina de cubrir. */
  iniciar: (destino: string) => void;
  /** La página destino ya montó: retira la capa. Sin transición en curso, no hace nada. */
  terminar: () => void;
}

const Contexto = createContext<Transicion>({
  iniciar: () => {},
  terminar: () => {},
});

export const useTransicion = () => useContext(Contexto);

function prefiereQuietud(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ProveedorTransicion({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const capaRef = useRef<HTMLDivElement>(null);
  const rutaRef = useRef<SVGPathElement>(null);
  const gsapRef = useRef<Gsap | null>(null);
  const tlRef = useRef<Linea | null>(null);
  const relojRef = useRef<number | null>(null);
  const estadoRef = useRef<Estado>("inactivo");

  const limpiarReloj = () => {
    if (relojRef.current !== null) {
      window.clearTimeout(relojRef.current);
      relojRef.current = null;
    }
  };

  // Carga diferida de GSAP y sus dos plugins. Si falla, `gsapRef` se queda en
  // null y todo el flujo cae al camino sin animación.
  useEffect(() => {
    let vivo = true;
    if (prefiereQuietud()) return;

    void (async () => {
      try {
        const [{ default: gsap }, { DrawSVGPlugin }, { CustomEase }] =
          await Promise.all([
            import("gsap"),
            import("gsap/DrawSVGPlugin"),
            import("gsap/CustomEase"),
          ]);
        if (!vivo) return;
        gsap.registerPlugin(DrawSVGPlugin, CustomEase);
        if (!CustomEase.get("osmo")) {
          CustomEase.create("osmo", "0.625, 0.05, 0, 1");
        }
        gsapRef.current = gsap;
      } catch {
        gsapRef.current = null;
      }
    })();

    return () => {
      vivo = false;
    };
  }, []);

  const terminar = useCallback(() => {
    // Solo si venimos de una transición: si alguien recarga /inicio o entra
    // directo, no tiene por qué cruzarle un trazo por la pantalla.
    if (estadoRef.current !== "cubierto") return;
    estadoRef.current = "inactivo";
    limpiarReloj();

    const gsap = gsapRef.current;
    const capa = capaRef.current;
    const ruta = rutaRef.current;
    if (!gsap || !capa || !ruta) return;

    const titulo = document.querySelector<HTMLElement>(`[${ATRIBUTO_TITULO}]`);

    tlRef.current?.kill();
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(capa, { autoAlpha: 0 });
        // clearProps para no dejar el título con estilos en línea: si algo lo
        // interrumpe después, tiene que quedar visible por CSS, no por GSAP.
        if (titulo) {
          gsap.set(titulo, { clearProps: "transform,opacity,visibility" });
        }
      },
    });

    tl.set(ruta, { drawSVG: "0% 100%" }).to(
      ruta,
      {
        drawSVG: "100% 100%",
        strokeWidth: TRAZO_FINO,
        duration: D_DESCUBRIR,
        ease: "osmo",
      },
      0,
    );

    if (titulo) {
      tl.fromTo(
        titulo,
        { yPercent: 22, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: D_TITULO, ease: "expo.out" },
        0.16,
      );
    }

    tlRef.current = tl;
  }, []);

  const iniciar = useCallback(
    (destino: string) => {
      const gsap = gsapRef.current;
      const capa = capaRef.current;
      const ruta = rutaRef.current;

      // Cualquier motivo para no animar → se navega igual. La animación es un
      // adorno; llegar a la pantalla no lo es.
      if (
        !gsap ||
        !capa ||
        !ruta ||
        estadoRef.current !== "inactivo" ||
        prefiereQuietud()
      ) {
        router.push(destino);
        return;
      }

      estadoRef.current = "cubriendo";
      // Prefetch aquí y no antes: sin sesión, /inicio responde con el redirect
      // del middleware y el prefetch no serviría de nada.
      router.prefetch(destino);

      tlRef.current?.kill();
      const tl = gsap.timeline({
        onComplete: () => {
          estadoRef.current = "cubierto";
          router.push(destino);
          limpiarReloj();
          relojRef.current = window.setTimeout(terminar, ESPERA_MAXIMA_MS);
        },
      });

      tl.set(capa, { autoAlpha: 1 })
        .set(ruta, { strokeWidth: TRAZO_FINO, drawSVG: "0% 0%" })
        .to(ruta, { drawSVG: "0% 85%", duration: D_CUBRIR, ease: "osmo" }, 0)
        .to(
          ruta,
          {
            strokeWidth: TRAZO_GRUESO,
            duration: D_CUBRIR * 0.85,
            ease: "power1.inOut",
          },
          D_CUBRIR * 0.15,
        );

      tlRef.current = tl;
    },
    [router, terminar],
  );

  useEffect(() => {
    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      limpiarReloj();
    };
  }, []);

  const valor = useMemo(() => ({ iniciar, terminar }), [iniciar, terminar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div
        ref={capaRef}
        aria-hidden
        data-transicion-capa
        className="pointer-events-none fixed inset-0 z-50 overflow-clip text-kido-turquesa opacity-0"
      >
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          fill="none"
          className="absolute -left-[15%] -top-[15%] h-[130%] w-[130%]"
        >
          <path
            ref={rutaRef}
            d={RUTA}
            stroke="currentColor"
            strokeWidth="0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Contexto.Provider>
  );
}
