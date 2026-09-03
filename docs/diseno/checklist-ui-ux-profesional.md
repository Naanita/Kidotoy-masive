# Checklist de UI/UX profesional

Lo que separa una página "que funciona" de una que se siente profesional casi nunca es la cantidad de componentes: son los **estados** y el **feedback**. Esta guía cubre ambos.

---

## 1. Estados completos en todo

Cada componente que toque datos necesita cubrir estos estados. Es lo que más se olvida.

| Estado | Qué hacer |
|---|---|
| **Loading** | Skeleton cuando ya conoces la forma del contenido. Spinner solo para acciones puntuales (botón enviando). |
| **Empty** | Icono o ilustración + explicación de por qué está vacío + CTA. Nunca una tabla en blanco. |
| **Error** | El motivo real + botón de reintentar. No solo "algo salió mal". |
| **Partial / stale** | Mostrar datos viejos mientras refresca, en vez de vaciar la pantalla. |
| **Success** | Confirmación visible de que la acción pasó. |

En elementos interactivos, cubrir siempre:

- `hover`
- `focus-visible`
- `active`
- `disabled`
- `loading`

---

## 2. Feedback de acciones

### Toasts
- Solo para cosas **no bloqueantes**: guardado, copiado, elemento movido.
- `aria-live="polite"` para que lectores de pantalla los anuncien.
- Auto-dismiss de 4–5 s, apilables, pausables al hacer hover.
- Posición consistente en todo el sitio.

### Inline
- Los errores de formulario van **pegados al campo que falló**, nunca en un toast.

### Optimistic UI
- Actualiza la interfaz de inmediato y revierte si el request falla.
- Es lo que hace que una app se sienta instantánea.

### Undo en vez de confirmar
- Para acciones reversibles: borrar directo + toast con "Deshacer" (~7 s).
- Mejor UX que interrumpir con un modal.

### Modal de confirmación
Solo para lo **destructivo e irreversible**:
- Incluir el nombre del elemento en el texto: "Eliminar *Reporte Q3*".
- El botón nombra la acción ("Eliminar"), no "OK".
- Botón destructivo en color de peligro; el de cancelar, secundario.
- Para lo muy grave, pedir que escriba el nombre para confirmar.

---

## 3. Formularios

Donde más se nota el nivel.

- **Validar en `blur`**, no en cada tecla. Después del primer error, sí validar en tiempo real mientras el usuario corrige.
- **Mensajes específicos**: "La contraseña necesita al menos un número", no "Formato inválido".
- **Botón de submit** deshabilitado + spinner durante el envío, para evitar doble envío.
- **Preservar los datos** si el submit falla. Suena obvio, se rompe todo el tiempo.
- **Atributos correctos**: `type`, `inputmode`, `autocomplete`. Teclado numérico en móvil y autollenado del navegador salen gratis.
- **Teclado**: autofocus en el primer campo, submit con Enter, navegación completa por Tab en orden lógico.
- **Formateo mientras escribe**: teléfono, tarjeta, moneda. Contador visible cuando hay máximo de caracteres.
- **Errores del servidor mapeados al campo** correspondiente, no como bloque genérico arriba.
- **Scroll automático** al primer campo con error al intentar enviar.
- **Advertir antes de salir** si hay cambios sin guardar.

---

## 4. Manejo de errores real

- **Distinguir tipos**: error de red, 4xx, 5xx, timeout. Cada uno se comunica distinto.
  - Red → "Revisa tu conexión" + reintentar
  - 401/403 → redirigir a login o explicar el permiso faltante
  - 404 → "No encontramos esto" + ruta de salida
  - 5xx → "Problema de nuestro lado" + reintentar
- **Retry con backoff exponencial** en fallos de red (3 intentos suele bastar).
- **Detectar offline** con `navigator.onLine` y mostrar banner persistente.
- **Error boundaries por sección**, no globales. Si falla el gráfico, que no muera toda la página.
- **Timeout explícito** en los fetch. Un request colgado sin límite es peor que un error.
- **Log del error real** a consola o monitoreo; mensaje humano al usuario.
- **Nunca exponer stack traces** ni mensajes crudos de la API al usuario final.

---

## 5. Accesibilidad y teclado

Esto es lo que separa una página "bonita" de una profesional.

- `focus-visible` con outline claro. Nunca `outline: none` sin reemplazo.
- **Modales**: focus trap, `Escape` cierra, click fuera cierra, el foco vuelve al botón que lo abrió, scroll del body bloqueado.
- **Dropdowns y selects**: navegables con flechas, Enter selecciona, Escape cierra.
- **Labels reales** asociadas al input. El placeholder no es un label.
- `aria-live` en zonas que cambian solas: toasts, resultados de búsqueda, contadores.
- **Contraste mínimo 4.5:1** en texto normal, 3:1 en texto grande y en bordes de controles.
- **Área táctil mínima de 44×44 px** en móvil.
- **Skip link** al contenido principal.
- Jerarquía de headings correcta (`h1` → `h2` → `h3`, sin saltos).

---

## 6. Detalles de pulido

### Layout
- **Sin layout shift**: reservar altura de imágenes y contenedores. El CLS es lo que hace ver barato un sitio.
- **Scroll restoration** al volver atrás.
- **Estados persistentes en la URL**: filtros, tabs, paginación, búsqueda. Que se pueda compartir y recargar sin perder contexto.

### Movimiento
- Transiciones de **150–250 ms**. Más lento se siente pesado.
- `ease-out` para entrar, `ease-in` para salir.
- Respetar `prefers-reduced-motion`.
- Animar `transform` y `opacity`, no `width`/`height`/`top`.

### Tooltips
- Delay de ~500 ms al entrar, 0 al salir dentro del mismo grupo.
- Solo información complementaria, **nunca crítica** — no funcionan en touch.
- Se cierran con `Escape` y aparecen también con foco de teclado.

### Iconos
- Una sola familia, mismo grosor de trazo, mismo tamaño óptico.
- Siempre con label visible o `aria-label`.
- Alineados ópticamente con el texto, no matemáticamente.

### Rendimiento percibido
- **Debounce** en búsquedas (~300 ms).
- **Throttle** en scroll y resize.
- **Prefetch** de rutas al hacer hover en un link.
- Lazy loading de imágenes fuera del viewport.

### Microdetalles
- Cursores correctos: `pointer` en clickeables, `not-allowed` en deshabilitados.
- Tabular numbers en tablas de cifras para que las columnas alineen.
- Fechas relativas ("hace 3 min") con la fecha exacta en el `title`.
- Estados de selección visibles en tablas y listas.
- Feedback al copiar al portapapeles.

---

## Orden de prioridad

Si el sitio ya existe y hay que empezar por algo:

1. **Estados vacíos y de carga** — impacto inmediato en percepción.
2. **Validación de formularios** con mensajes específicos.
3. **Manejo diferenciado de errores de red.**
4. **Accesibilidad de teclado** en modales y dropdowns.
5. Layout shift y transiciones.

Eso solo ya sube el nivel percibido bastante más que agregar animaciones.
