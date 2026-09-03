# Sistema de diseño y panel de temas

Lee esto antes de escribir cualquier componente.

## Principio único

**Ningún color, tamaño de fuente, radio ni espaciado se escribe directamente en un
componente.** Todo sale de variables CSS. Si necesitas un valor que no existe como token,
agrégalo al tema, no lo escribas a mano.

Esto no es purismo: el panel `/dev/tema` solo funciona si absolutamente todo el estilo pasa
por variables. Un solo `text-blue-600` suelto rompe la promesa.

```tsx
// INCORRECTO
<div className="bg-blue-600 text-white rounded-lg p-4">

// CORRECTO
<div className="bg-primary text-primary-foreground rounded-lg p-4">
```

---

## Tokens

Convención de shadcn/ui, en `globals.css` bajo `:root` y `.dark`.

### Color
Se guardan como canales HSL sin la función `hsl()`, que es como shadcn los consume.

| Token | Uso |
|---|---|
| `--background` / `--foreground` | Fondo y texto base |
| `--card` / `--card-foreground` | Superficies elevadas |
| `--popover` / `--popover-foreground` | Menús y diálogos |
| `--primary` / `--primary-foreground` | Acción principal, marca |
| `--secondary` / `--secondary-foreground` | Acción secundaria |
| `--muted` / `--muted-foreground` | Texto de apoyo, fondos suaves |
| `--accent` / `--accent-foreground` | Resaltados |
| `--destructive` / `--destructive-foreground` | Errores, agotado, liberar |
| `--success` / `--success-foreground` | Confirmado, entregado |
| `--warning` / `--warning-foreground` | Stock bajo |
| `--border` / `--input` / `--ring` | Bordes, campos, foco |

`--success` y `--warning` no vienen en shadcn por defecto. Agrégalos, porque este producto
vive de estados: pendiente, confirmado, agotado, entregado.

### Tipografía

| Token | Uso |
|---|---|
| `--font-heading` | Títulos |
| `--font-body` | Texto corrido |
| `--font-size-base` | Tamaño raíz, por defecto `16px` |
| `--font-scale` | Razón de la escala tipográfica, por defecto `1.2` |
| `--font-weight-heading` | Peso de títulos |

Las fuentes se cargan con `next/font/google`. El panel ofrece una lista corta y curada
(Inter, Geist, Manrope, Plus Jakarta Sans, Source Sans 3, Nunito Sans, Outfit, Figtree),
no un buscador abierto: cargar fuentes arbitrarias en tiempo de ejecución degrada el
rendimiento y rompe el renderizado del servidor.

### Forma y espacio

| Token | Uso |
|---|---|
| `--radius` | Radio base; los componentes derivan de él |
| `--spacing-unit` | Unidad base, por defecto `0.25rem` |
| `--density` | `compacta` · `normal` · `amplia`, multiplica el espaciado |
| `--shadow-level` | `ninguna` · `sutil` · `media` |

### Marca

| Token | Uso |
|---|---|
| `--logo-url` | Logo principal |
| `--logo-dark-url` | Variante para modo oscuro |
| `--favicon-url` | Icono |
| `--marca-nombre` | Nombre mostrado en encabezados |

---

## Cómo se aplica

1. `globals.css` define los valores por defecto en `:root`.
2. El layout raíz lee la fila de `tema` de la empresa activa.
3. Inyecta un `<style>` con las variables que difieren del valor por defecto.
4. Tailwind ya está configurado para leer esas variables, según la convención de shadcn.

```tsx
// app/layout.tsx (esquema)
const tema = await obtenerTema(empresaId)

<html>
  <head>
    <style dangerouslySetInnerHTML={{ __html: `:root{${serializarTokens(tema)}}` }} />
  </head>
  ...
</html>
```

`serializarTokens` debe validar cada valor contra una lista blanca de tokens conocidos y
sanear el contenido antes de inyectarlo. Es entrada de base de datos yendo a un `<style>`:
sin validación es un vector de inyección.

---

## Panel `/dev/tema`

Ruta oculta, sin enlaces, protegida por rol `admin_dev`.

**Disposición:** controles a la izquierda, vista previa en vivo a la derecha. En pantalla
angosta, controles arriba y vista previa abajo.

**Controles**

- Selectores de color con campo hexadecimal editable y conversión automática a HSL
- Botón "generar variantes" que deriva `foreground`, `muted` y `accent` desde el primario
  con contraste suficiente
- Menús desplegables para fuente de títulos y de cuerpo, con muestra visible
- Deslizadores para tamaño base, escala, radio y unidad de espaciado
- Selector de densidad y de nivel de sombra
- Campos de URL para logo, logo oscuro y favicon, con vista previa
- Interruptor de modo claro y oscuro para revisar ambos

**Vista previa**
Debe mostrar componentes reales del producto, no cuadros de muestra: una tarjeta de
juguete con su estado de disponibilidad, una tarjeta de beneficiario confirmado, un botón
principal, una alerta de error, una fila de tabla del panel y el encabezado con el logo.
Solo así se ve si un cambio funciona de verdad.

**Acciones**

- Guardar (escribe en `tema`)
- Restablecer valores por defecto
- Exportar el tema como JSON
- Importar un tema desde JSON

**Verificación de contraste.** El panel calcula la razón de contraste de cada par de
color y advierte cuando cae por debajo de 4.5:1. No lo bloquea, pero lo advierte: los
colaboradores van a usar esto en un celular al sol.

---

## Reglas por espacio

Los cuatro espacios comparten tokens pero no densidad:

- `/acceso` — táctil, generoso, un objetivo por pantalla. Es gente no técnica en el
  celular.
- `/kidotoy` — denso, orientado a tablas, mucha información visible a la vez.
- `/empresa` — intermedio, orientado a lectura y a exportar.
- `/entrega` — el más grande de todos. Botones enormes, contraste máximo, poco texto. Se
  usa de pie, con una mano, con sol encima.

---

## Componentes de shadcn a instalar

`button` · `card` · `input` · `label` · `form` · `select` · `dialog` · `alert-dialog` ·
`alert` · `badge` · `table` · `tabs` · `toast` (o `sonner`) · `skeleton` · `separator` ·
`avatar` · `dropdown-menu` · `sheet` · `switch` · `slider` · `tooltip` · `progress`

---

## Accesibilidad mínima

- Todo control alcanzable con teclado y con foco visible
- Imágenes de juguetes con texto alternativo real
- El estado nunca se comunica solo con color: agotado lleva etiqueta, confirmado lleva
  icono y texto
- Objetivos táctiles de al menos 44 píxeles en `/acceso` y `/entrega`
