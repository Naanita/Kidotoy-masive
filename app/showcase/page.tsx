import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Info,
  TriangleAlert,
  XCircle,
  Gift,
  Inbox,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ChipEstado } from "@/components/estado/chip-estado";
import { BarraEstado } from "@/components/estado/barra-estado";
import { AvatarInicial } from "@/components/estado/avatar-inicial";
import { EstadoVacio } from "@/components/estado/estado-vacio";
import {
  SkeletonBeneficiarios,
  SkeletonCatalogo,
} from "@/components/estado/skeletons";
import { Stepper } from "@/components/colaborador/stepper";
import { IndicadorVivo } from "@/components/colaborador/indicador-vivo";
import { FranjaMarca } from "@/components/marca/franja";
import { NubeMarca } from "@/components/marca/nube";
import { CoronaMarca } from "@/components/marca/corona";
import { Destellos } from "@/components/marca/destellos";
import { TarjetaProducto } from "@/components/colaborador/tarjeta-producto";
import { TarjetaBeneficiario } from "@/components/colaborador/tarjeta-beneficiario";
import type { TipoEstado } from "@/components/estado/config-estado";
import type { Producto, BeneficiarioConEstado } from "@/lib/colaborador/datos";
import { cn } from "@/lib/utils";

/**
 * Escaparate de componentes — SOLO para revisión de diseño. Nunca en producción:
 * no está enlazado en ninguna parte y aquí se corta en build de producción.
 * Sirve para ver el gesto (la cápsula por estado) aplicado en todo el sistema y
 * validar contraste, sobre todo el amarillo de Kidotoy sobre blanco.
 */
export const metadata = { title: "Escaparate de componentes" };

const juguete = (bg: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='600' height='600' fill='${bg}'/><g fill='#ffffff'><rect x='170' y='260' width='260' height='190' rx='14'/><rect x='170' y='214' width='260' height='58' rx='12' opacity='0.92'/><rect x='286' y='214' width='28' height='236' opacity='0.85'/><path d='M300 214c-26-54-96-40-96 4 0 22 40 30 96 30-56 0 4-30 0-64z' opacity='0.9'/><path d='M300 214c26-54 96-40 96 4 0 22-40 30-96 30 56 0-4-30 0-64z' opacity='0.9'/></g></svg>`,
  )}`;

const productos: Record<string, Producto> = {
  disponible: {
    id: "1",
    nombre: "Set de bloques constructores",
    descripcion: "120 piezas para armar y crear sin límite.",
    imagen_url: juguete("#16ABB6"),
    stock_disponible: 24,
    codigo_referencia: "REF-07N1",
  },
  ultimas: {
    id: "2",
    nombre: "Cocina de juguete con luces",
    descripcion: "Sin foto aún: muestra el preview de marca.",
    imagen_url: null,
    stock_disponible: 2,
    codigo_referencia: "REF-07N2",
  },
  agotado: {
    id: "3",
    nombre: "Pista de carreras nocturna",
    descripcion: "Dos carros y curvas que brillan.",
    imagen_url: juguete("#8373AC"),
    stock_disponible: 0,
    codigo_referencia: "REF-07N3",
  },
};

const beneficiarios: BeneficiarioConEstado[] = [
  { id: "a", nombre: "Mariana Rojas", edad: 7, genero: "Niña", seleccion: null },
  {
    id: "b",
    nombre: "Tomás Herrera",
    edad: 3,
    genero: "Niño",
    seleccion: {
      codigo_entrega: "0B636E4D65",
      producto: "Tren de madera",
      imagenUrl: null,
    },
  },
];

const chips: TipoEstado[] = [
  "disponible",
  "ultimas",
  "agotado",
  "confirmado",
  "pendiente",
  "entregado",
  "fuera_de_carpa",
];

function Seccion({
  titulo,
  nota,
  acento = "bg-kido-turquesa",
  children,
}: {
  titulo: string;
  nota?: string;
  acento?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-2">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className={cn("h-6 w-1.5 shrink-0 rounded-full", acento)}
        />
        <h2 className="font-display text-xl font-bold text-foreground">
          {titulo}
        </h2>
      </div>
      {nota && (
        <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">{nota}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Showcase() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-5 py-10">
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-kido-turquesa to-kido-marino px-6 py-10 text-card shadow-lg sm:px-10">
        <Destellos className="text-card" />
        <div className="relative">
          <p className="font-heading text-xs font-semibold uppercase tracking-wide text-card/80">
            Sistema de diseño · Acueducto × Kidotoy
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold">
            Escaparate de componentes
          </h1>
          <p className="mt-2 max-w-2xl text-card/90">
            El azul del Acueducto manda la acción; el color de Kidotoy da la
            atmósfera y la alegría. El gesto que unifica todo es una cápsula
            corta de extremos redondeados cuyo color viene del estado.
          </p>
        </div>
        <FranjaMarca className="absolute inset-x-0 bottom-0 h-2" />
      </header>

      <Seccion
        titulo="Identidad Kidotoy · devices del keyvisual"
        nota="Marco Acueducto con guiños Kidotoy: la franja de 4 colores (firma de marca), la nube, la corona y los destellos. Colores exactos del manual."
      >
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border">
            <FranjaMarca className="h-2.5" />
            <div className="flex items-center justify-between gap-4 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <span>Franja de marca al pie de logins y encabezados</span>
              <span className="font-mono text-xs">
                #10B7CD · #E84141 · #F8AB11 · #8974B3
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Nube (sobre turquesa, como el keyvisual) */}
            <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-lg bg-kido-turquesa">
              <Destellos className="text-card" />
              <NubeMarca className="relative w-40 text-card" />
            </div>
            {/* Corona */}
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border bg-muted/30">
              <CoronaMarca className="w-16" />
              <span className="text-xs text-muted-foreground">
                Corona · momentos de logro
              </span>
            </div>
            {/* Celebración de ejemplo */}
            <div className="relative flex h-40 flex-col items-center justify-center overflow-hidden rounded-lg border bg-accent/40 text-center">
              <Destellos />
              <div className="relative">
                <CoronaMarca className="mx-auto mb-1 w-10" />
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15">
                  <CheckCircle2 className="size-7 text-success" aria-hidden />
                </span>
                <p className="mt-2 font-display text-lg font-bold text-foreground">
                  ¡Regalo confirmado!
                </p>
              </div>
            </div>
          </div>
        </div>
      </Seccion>

      <Seccion
        titulo="El gesto · la cápsula por estado"
        acento="bg-kido-morado"
        nota="La misma forma a distintas escalas: chip, riel de alertas/toasts, tramo activo del stepper y lomo de tarjeta. El color codifica estado, nunca edad."
      >
        <div className="flex flex-wrap items-center gap-8 rounded-lg border bg-muted/30 p-6">
          <div className="flex items-center gap-3">
            <BarraEstado tipo="disponible" className="h-8" />
            <BarraEstado tipo="ultimas" className="h-8" />
            <BarraEstado tipo="agotado" className="h-8" />
            <BarraEstado tipo="pendiente" className="h-8" />
          </div>
          <div className="w-40">
            <BarraEstado tipo="disponible" horizontal />
          </div>
          <ChipEstado tipo="disponible" />
        </div>
      </Seccion>

      <Seccion
        titulo="Botones"
        acento="bg-primary"
        nota="Cuatro variantes en sus estados. Elevación azulada al pasar, hundido al presionar, deshabilitado en gris (no solo opacidad)."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Elegir este</Button>
            <Button variant="outline">Ver comprobante</Button>
            <Button variant="secondary">Filtrar</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="destructive">Liberar selección</Button>
            <Button variant="link">Saber más</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Deshabilitado</Button>
            <Button variant="outline" disabled>
              Deshabilitado
            </Button>
            <Button size="sm">Pequeño</Button>
            <Button size="lg">Grande</Button>
            <Button size="icon" aria-label="Buscar">
              <Search />
            </Button>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Campos" acento="bg-kido-rojo" nota="Etiqueta arriba, ayuda o error abajo. Nunca placeholder como etiqueta.">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="c1">Cédula</Label>
            <Input id="c1" placeholder="1234567890" inputMode="numeric" />
            <p className="text-xs text-muted-foreground">
              Sin puntos ni espacios.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c2">Código SAP</Label>
            <Input id="c2" defaultValue="SAP-007340" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c3" className="text-destructive">
              Código SAP
            </Label>
            <Input
              id="c3"
              defaultValue="000"
              aria-invalid
              className="border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
            />
            <p className="text-xs font-medium text-destructive">
              Los datos no coinciden. Verifica e intenta de nuevo.
            </p>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Chips de estado" acento="bg-kido-amarillo" nota="Píldora con la barra del gesto como tope, ícono y texto. El estado nunca se comunica solo con color.">
        <div className="flex flex-wrap gap-3">
          {chips.map((t) => (
            <ChipEstado key={t} tipo={t} />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Avisos en línea" nota="Riel izquierdo redondeado (el gesto), fondo tenue del color, ícono y texto oscuro legible.">
        <div className="space-y-3">
          <Alert variant="info">
            <Info aria-hidden />
            <AlertTitle>Ventana de selección abierta</AlertTitle>
            <AlertDescription>
              Tienes hasta el 12 de diciembre para elegir el regalo de cada hijo.
            </AlertDescription>
          </Alert>
          <Alert variant="success">
            <CheckCircle2 aria-hidden />
            <AlertDescription>
              Selección confirmada. Revisa tu correo con el código de entrega.
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <TriangleAlert aria-hidden />
            <AlertDescription>
              Quedan pocas unidades de esta referencia. Confirma pronto.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <XCircle aria-hidden />
            <AlertDescription>
              Esta unidad se agotó mientras decidías. Elige otra opción.
            </AlertDescription>
          </Alert>
        </div>
      </Seccion>

      <Seccion titulo="Notificaciones (toast)" acento="bg-kido-morado" nota="Mismo gesto que las alertas: riel redondeado de color. Aparecen arriba a la derecha (escritorio) o centradas (móvil).">
        <div className="flex flex-wrap gap-4">
          {[
            { i: CheckCircle2, c: "before:bg-success text-success", t: "Código copiado", d: "Ya puedes pegarlo donde lo necesites." },
            { i: Info, c: "before:bg-primary text-primary", t: "Sesión iniciada", d: "Bienvenido de vuelta." },
            { i: TriangleAlert, c: "before:bg-warning text-warning", t: "Últimas unidades", d: "Esta referencia se está agotando." },
            { i: XCircle, c: "before:bg-destructive text-destructive", t: "No se pudo confirmar", d: "Intenta de nuevo en un momento." },
          ].map(({ i: Icon, c, t, d }) => (
            <div
              key={t}
              className={`relative flex w-72 items-center gap-3 rounded-md border border-border bg-card py-3 pl-5 pr-4 shadow-lg before:absolute before:left-2 before:top-3 before:bottom-3 before:w-1 before:rounded-full before:content-[''] ${c.split(" ")[0]}`}
            >
              <Icon className={`size-5 ${c.split(" ")[1]}`} aria-hidden />
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  {t}
                </p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Progreso (stepper)" acento="bg-primary" nota="Conector activo como cápsula gruesa redondeada; paso actual en azul con anillo.">
        <div className="space-y-8">
          <div className="mx-auto max-w-md">
            <Stepper actual={2} />
          </div>
          <div className="mx-auto max-w-md">
            <Stepper actual={4} />
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Tarjeta de juguete" acento="bg-kido-rojo" nota="Imagen cuadrada arriba, chip flotante sólido (legible sobre la foto), nombre en Fredoka. Sin foto real se muestra el preview de marca. Agotado: imagen atenuada, chip rojo, botón deshabilitado — nunca se oculta.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <TarjetaProducto producto={productos.disponible} beneficiarioId="x" />
          <TarjetaProducto producto={productos.ultimas} beneficiarioId="x" />
          <TarjetaProducto producto={productos.agotado} beneficiarioId="x" />
        </div>
      </Seccion>

      <Seccion titulo="Tarjeta de beneficiario" acento="bg-kido-amarillo" nota="Lomo izquierdo (el gesto) por estado, avatar de iniciales con color por nombre (decorativo), edad en texto.">
        <div className="grid gap-4 sm:grid-cols-2">
          {beneficiarios.map((b) => (
            <TarjetaBeneficiario key={b.id} b={b} />
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Avatar, disponibilidad en vivo y estado vacío">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <AvatarInicial nombre="Mariana Rojas" className="size-12 text-base" />
            <AvatarInicial nombre="Tomás Herrera" className="size-12 text-base" />
            <AvatarInicial nombre="Valentina Cruz" className="size-12 text-base" />
            <AvatarInicial nombre="Samuel Díaz" className="size-12 text-base" />
          </div>
          <IndicadorVivo />
          <div className="max-w-md">
            <EstadoVacio
              icon={Inbox}
              titulo="Aún no hay selecciones"
              descripcion="Cuando los colaboradores empiecen a elegir, verás el avance aquí."
            >
              <Button variant="outline">
                <Gift />
                Ver catálogo
              </Button>
            </EstadoVacio>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Cargando (esqueletos)" acento="bg-kido-morado" nota="Misma forma que el contenido real, sin saltos de layout.">
        <div className="space-y-6">
          <SkeletonBeneficiarios n={2} />
          <SkeletonCatalogo n={3} />
        </div>
      </Seccion>

      <footer className="overflow-hidden rounded-2xl">
        <FranjaMarca className="h-2.5" />
      </footer>
    </div>
  );
}
