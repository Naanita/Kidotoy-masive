# DESIGN.md — Plataforma de Regalos · Acueducto de Bogotá × Kidotoy

## 0. Principio rector

Esta plataforma es un programa de bienestar de la **Empresa de Acueducto y Alcantarillado
de Bogotá**, entidad pública, operado por **Kidotoy**, una juguetería infantil.

La relación entre ambas marcas es una **jerarquía, no una mezcla**:

- **El marco es Acueducto.** Estructura, navegación, fondos, encabezados, formularios,
  tablas y botones principales. Azul institucional, blanco dominante, limpio, confiable.
  El colaborador tiene que sentir que está en un sistema oficial de su empleador.
- **El contenido es Kidotoy.** Las tarjetas de juguete, los chips de estado, las
  celebraciones, las ilustraciones y los acentos de color. Ahí entra la alegría.

Regla práctica: **el azul manda la pantalla, los colores de Kidotoy viven dentro de las
tarjetas y los momentos de celebración.** Nunca un fondo completo en colores Kidotoy salvo
en las pantallas de éxito.

Tono: cálido pero serio. Es un regalo para los hijos de los empleados, no una tienda.
Confiable primero, alegre después.

---

## 1. Tema visual y atmósfera

Diseño limpio, luminoso y espacioso, con formas redondeadas y mucho aire. Fondo blanco
como lienzo principal, superficies gris muy claro para agrupar, y azul institucional como
único acento estructural.

**Características:**
- Fondo blanco `#FFFFFF` dominante; nunca fondos oscuros salvo la barra lateral del panel
  administrativo y las pantallas de confirmación a página completa
- Acento único estructural: `#007BFF`
- Esquinas redondeadas generosas en todo: 12px en tarjetas, 8px en botones, píldora en chips
- Sombras suaves y difusas con tinte azulado, nunca negras ni duras
- Ilustración 3D redondeada y amable para momentos emocionales
- Espacio en blanco abundante. Cuando dudes, más aire
- Etiquetas: luminoso, redondeado, institucional-cálido, sin serifas

---

## 2. Paleta de colores y roles

### Capa institucional — Acueducto (estructura)

- **Primario** `#007BFF` · `--color-primary` — Botones principales, enlaces, estado activo, foco
- **Primario oscuro** `#1361C5` · `--color-primary-dark` — Hover, énfasis secundario
- **Azul profundo** `#0B3A78` · `--color-primary-deep` — Barra lateral admin, títulos de peso
- **Azul claro** `#E7F5FF` · `--color-primary-soft` — Fondos de aviso informativo, superficies destacadas
- **Fondo** `#FFFFFF` · `--color-bg` — Lienzo principal
- **Superficie** `#F5F7FA` · `--color-surface` — Tarjetas agrupadoras, filas alternas, fondos de sección
- **Borde** `#EDEDED` · `--color-border` — Divisores, contornos, bordes de campo
- **Texto principal** `#333333` · `--color-text` — Títulos y cuerpo. Nunca negro puro
- **Texto secundario** `#666666` · `--color-text-muted` — Apoyo, leyendas, marcadores de posición

### Capa de contenido — Kidotoy (alegría)

Colores oficiales del manual de marca de Kidotoy. Se usan **dentro** de tarjetas, chips,
ilustraciones y celebraciones. Nunca como fondo de pantalla completa salvo en éxito.

- **Turquesa** `#16ABB6` · `--kido-turquesa`
- **Rojo** `#E23C3D` · `--kido-rojo` (Pantone Warm Red C)
- **Amarillo** `#F4A612` · `--kido-amarillo`
- **Morado** `#8373AC` · `--kido-morado`
- **Azul marino** `#101460` · `--kido-marino`

### Semánticos

Los colores de Kidotoy hacen doble función como semánticos, lo que mantiene la paleta corta
y nativa a la marca:

- **Éxito / Confirmado / Disponible** `#22C55E`
- **Advertencia / Últimas unidades** `#F4A612` (amarillo Kidotoy)
- **Error / Agotado / Destructivo** `#E23C3D` (rojo Kidotoy)
- **Informativo** `#007BFF`

Todo estado se comunica con **color más icono más texto**, nunca solo con color. Los
usuarios acceden desde el celular, a veces a plena luz del día.

---

## 3. Tipografía

Las fuentes originales de marca no son libres: el Acueducto usa Helvetica Neue y Kidotoy
usa Volkswagen Serial Heavy y Century Gothic. Se sustituyen por equivalentes cercanos
disponibles en Google Fonts.

| Rol | Fuente | Uso |
|---|---|---|
| **Display Kidotoy** | Fredoka (SemiBold 600 / Bold 700) | Solo momentos de alegría: pantallas de éxito, títulos del catálogo, saludo de bienvenida, nombres de juguete en tarjeta destacada |
| **Títulos** | Montserrat (Medium 500 / SemiBold 600) | Todos los encabezados estructurales, títulos de sección, encabezados de tabla |
| **Cuerpo** | Inter (Regular 400 / Medium 500) | Todo el texto corrido, campos, tablas, etiquetas, botones |

**Fredoka se usa con moderación.** Es el acento emocional, no la voz por defecto. Si una
pantalla completa está en Fredoka, está mal.

### Escala tipográfica

| Token | Tamaño | Interlineado | Uso |
|---|---|---|---|
| Display | 40px | 48px | Título de pantalla de éxito, bienvenida |
| H1 | 32px | 40px | Título principal de pantalla |
| H2 | 24px | 32px | Títulos de sección |
| H3 | 20px | 28px | Subtítulos, títulos de tarjeta |
| Body L | 18px | 28px | Texto destacado, descripciones |
| Body | 16px | 24px | Texto general, campos |
| Small | 14px | 20px | Ayudas, metadatos, chips |
| Caption | 12px | 16px | Leyendas, notas al pie |

En móvil, reducir un escalón: Display 32, H1 24, H2 20.

**Código de entrega:** siempre en monoespaciada, en grupos separados, tamaño grande y con
peso. Es un dato que la gente dicta por teléfono y transcribe a mano.

---

## 4. Componentes

### Botones

- **Primario:** fondo `#007BFF`, texto blanco, radio 8px, altura 48px en móvil y 44px en
  escritorio, peso 500. Hover a `#1361C5`.
- **Secundario:** fondo blanco, borde 1px `#007BFF`, texto `#007BFF`, mismo radio y altura.
- **Terciario / texto:** sin fondo ni borde, texto `#007BFF`, con flecha o icono opcional.
- **Destructivo:** fondo `#E23C3D`, texto blanco. Solo para acciones irreversibles.
- **Deshabilitado:** fondo `#EDEDED`, texto `#999999`, cursor no permitido.
- **Cargando:** indicador giratorio dentro del botón, texto en pasado o gerundio, botón
  bloqueado para evitar doble envío.

Los cinco estados (normal, hover, foco, activo, deshabilitado) deben verse distintos. El
foco lleva un anillo visible de 2px en `#007BFF` con separación.

### Tarjeta de juguete

Es el componente más importante del producto.

Imagen del juguete en proporción cuadrada arriba, ocupando todo el ancho, esquinas
redondeadas solo arriba. Debajo: chip de estado, nombre del juguete en Fredoka SemiBold,
descripción corta en gris, disponibilidad, y botón de acción a todo el ancho.

Fondo blanco, borde `#EDEDED` de 1px, radio 12px, sombra suave azulada. En hover se eleva
ligeramente y la sombra crece.

**Estado agotado:** la tarjeta se muestra igual pero con la imagen al 45% de opacidad, chip
rojo "Agotado" bien visible, y botón deshabilitado. Nunca se oculta.

### Chips de estado

Píldoras de radio completo, fondo del color al 12% de opacidad, texto y borde en el color
pleno, con icono pequeño a la izquierda. Tamaño Small.

- Disponible → verde
- Últimas unidades → amarillo Kidotoy
- Agotado → rojo Kidotoy
- Confirmado → verde con icono de verificación
- Pendiente → azul claro con icono de reloj
- Entregado → verde
- Fuera de carpa → morado Kidotoy

### Tarjeta de beneficiario

Avatar circular con las iniciales del niño sobre un color de Kidotoy derivado de su nombre.
**Nunca fotografías de menores.** Al lado, nombre en Montserrat SemiBold, edad en gris, y
chip de estado. Botón de acción alineado a la derecha o abajo en móvil.

### Campos de formulario

Etiqueta visible encima del campo, siempre. El marcador de posición nunca reemplaza la
etiqueta. Borde `#EDEDED`, radio 8px, altura 48px, fondo blanco. Al enfocar, borde
`#007BFF` con anillo suave. Error: borde rojo con mensaje debajo del campo, nunca en un
aviso flotante.

### Avisos en línea

Fondo del color semántico al 8%, borde izquierdo de 3px en el color pleno, icono a la
izquierda, radio 8px. Cuatro variantes: informativo, éxito, advertencia y error.

### Notificaciones flotantes (toast)

Esquina superior derecha en escritorio, superior centrada en móvil. Fondo blanco, sombra
media, borde izquierdo de 3px en el color semántico, icono, texto en una o dos líneas y
botón de cierre. Se apilan y desaparecen a los 4 o 5 segundos.

Se usan para confirmaciones no bloqueantes: sesión iniciada, cambios guardados, exportación
lista, código copiado. **Los errores de formulario nunca van en toast, van pegados al campo.**

### Barra de pasos

Para el flujo del colaborador: Beneficiarios → Elegir regalo → Confirmación → Comprobante.
Círculos numerados unidos por una línea. Completados en azul con verificación, actual en
azul con anillo, pendientes en gris. Etiqueta debajo de cada paso en escritorio, solo el
paso actual en móvil.

### Tablas

Encabezado con fondo `#F5F7FA`, texto en Montserrat Medium, tamaño Small, mayúsculas
suaves. Filas con borde inferior `#EDEDED`, alto cómodo, hover en azul muy claro. Cifras
alineadas a la derecha con numeración tabular. Paginación abajo a la derecha.

### Estados vacíos

Ilustración o icono grande y amable, título en Montserrat, explicación de por qué está
vacío en gris, y una acción si la hay. Nunca una tabla en blanco ni un área muerta.

### Esqueletos de carga

Bloques gris claro con animación de brillo suave, con la forma real del contenido que va a
llegar. Se usan cuando ya se conoce la estructura. El indicador giratorio solo dentro de
botones.

---

## 5. Principios de disposición

- Unidad base de espaciado: **4px**. Todos los espacios son múltiplos: 8, 12, 16, 24, 32, 48, 64
- Ancho máximo de contenido: 1280px, centrado
- Rejilla de 12 columnas en escritorio, una sola columna en móvil
- Separación entre tarjetas: 24px en escritorio, 16px en móvil
- Relleno interno de tarjeta: 24px en escritorio, 16px en móvil
- Objetivo táctil mínimo 44×44px

### Radios

| Token | Valor | Uso |
|---|---|---|
| radius-sm | 6px | Chips pequeños, etiquetas |
| radius-md | 8px | Botones, campos |
| radius-lg | 12px | Tarjetas, diálogos |
| radius-xl | 20px | Contenedores destacados, secciones héroe |
| radius-full | 9999px | Chips de estado, avatares |

### Sombras

Siempre con tinte azulado, nunca negro puro.

| Nivel | Valor | Uso |
|---|---|---|
| sm | `0 1px 2px rgba(11,58,120,0.06)` | Campos, chips |
| md | `0 4px 12px rgba(11,58,120,0.08)` | Tarjetas |
| lg | `0 8px 24px rgba(11,58,120,0.12)` | Tarjetas en hover, menús |
| xl | `0 16px 48px rgba(11,58,120,0.16)` | Diálogos, elementos flotantes |

---

## 6. Densidad por espacio

La plataforma tiene cuatro espacios con contextos de uso muy distintos. Comparten los
mismos componentes pero **no la misma densidad**.

**Espacio del colaborador — cómodo y táctil.**
Se usa en el celular, por gente no técnica, con un código que le llegó por correo interno.
Un objetivo principal por pantalla, botones grandes, mucho aire, tipografía generosa. Es la
cara del producto y lo que evalúa el cliente final.

**Panel de administración de Kidotoy — denso.**
Escritorio, uso profesional, mucha información visible a la vez. Barra lateral azul profundo
`#0B3A78` con el logo de Kidotoy. Tarjetas de métricas arriba, gráficas y tablas debajo.
Tipografía compacta, filas ajustadas.

**Portal del Acueducto — intermedio.**
Escritorio, orientado a lectura y exportación. Más aire que el panel de Kidotoy, menos que
el del colaborador. Marca del Acueducto dominante. Solo consulta: sin ningún control de
edición visible.

**Módulo de entrega — el más grande de todos.**
Se usa de pie, con una mano, al aire libre, con sol encima y una fila esperando. Botones
enormes, contraste máximo, texto mínimo. La confirmación de entrega ocupa la pantalla
completa en verde y debe ser legible a un metro de distancia. El aviso de "ya entregado"
ocupa la pantalla completa en rojo.

---

## 7. Movimiento

- Transiciones de 150 a 250 ms. Más lento se siente pesado
- `ease-out` al entrar, `ease-in` al salir
- Animar solo `transform` y `opacity`
- Respetar `prefers-reduced-motion`: sin animación, cambio directo
- La celebración de la entrega y del comprobante puede tener confeti o una animación breve,
  pero desactivable por esa preferencia

---

## 8. Qué hacer y qué no

### Sí
- Usar blanco como fondo dominante y `#007BFF` como único acento estructural
- Reservar los colores de Kidotoy para tarjetas, chips, ilustraciones y celebraciones
- Usar Fredoka solo en momentos de alegría, Montserrat en títulos, Inter en todo lo demás
- Redondear todo con generosidad
- Sombras con tinte azul, suaves y difusas
- Comunicar cada estado con color, icono y texto a la vez
- Mostrar los juguetes agotados deshabilitados, nunca ocultos
- Dar 44×44px mínimo a todo lo tocable
- Usar iniciales en círculo de color para los niños

### No
- No usar fondos oscuros, salvo la barra lateral del panel y las pantallas de confirmación
- No pintar pantallas completas con colores de Kidotoy salvo en éxito
- No usar Fredoka para texto corrido
- No usar negro puro en texto
- No usar esquinas rectas: se sienten hostiles en este lenguaje
- No mostrar fotografías de menores en ninguna parte
- No inventar pantallas, campos ni botones que no estén descritos
- No poner errores de formulario en notificaciones flotantes
- No comunicar un estado únicamente con color

---

## 9. Comportamiento responsivo

| Punto de quiebre | Ancho | Comportamiento |
|---|---|---|
| Móvil | < 640px | Una columna, catálogo en dos columnas de tarjeta, tipografía un escalón menor |
| Tableta | 640–1024px | Dos columnas donde tenga sentido, tablas con desplazamiento horizontal |
| Escritorio | 1024–1440px | Disposición completa, catálogo en tres columnas |
| Amplio | > 1440px | Contenedor de máximo 1280px, centrado |

El espacio del colaborador y el módulo de entrega se diseñan **primero para móvil**. El
panel de administración y el portal del Acueducto se diseñan **primero para escritorio**.

---

## 10. Referencia rápida

```
Fondo            #FFFFFF
Superficie       #F5F7FA
Texto            #333333
Texto secundario #666666
Borde            #EDEDED

Primario         #007BFF
Primario oscuro  #1361C5
Azul profundo    #0B3A78
Azul claro       #E7F5FF

Kidotoy turquesa #16ABB6
Kidotoy rojo     #E23C3D
Kidotoy amarillo #F4A612
Kidotoy morado   #8373AC
Kidotoy marino   #101460

Éxito            #22C55E
Advertencia      #F4A612
Error            #E23C3D

Display  Fredoka
Títulos  Montserrat
Cuerpo   Inter

Radio    8px botones · 12px tarjetas · píldora en chips
Espacio  base 4px
```
