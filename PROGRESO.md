# PROGRESO

Registro de avance por fase. Se actualiza al final de cada fase: qué quedó hecho,
qué decisiones se tomaron y qué quedó pendiente.

---

## Fase 0 · Cimientos — ✅ Completada (2026-09-02)

### Qué quedó hecho

- **Next.js (App Router) + TypeScript + Tailwind v3** inicializados a mano (no con
  `create-next-app`, que se niega a correr en una carpeta que ya tenía `README.md`,
  `CLAUDE.md`, `supabase/`, etc.).
- **shadcn/ui** inicializado (estilo *new-york*, base *neutral*, variables CSS) con los
  22 componentes de `docs/02`: `button, card, input, label, form, select, dialog,
  alert-dialog, alert, badge, table, tabs, sonner, skeleton, separator, avatar,
  dropdown-menu, sheet, switch, slider, tooltip, progress`. (Se usa `sonner` en vez de
  `toast`, como permite la especificación.)
- **Clientes de Supabase**: navegador (`lib/supabase/client.ts`), servidor con cookies
  (`lib/supabase/server.ts`), anónimo sin sesión (`lib/supabase/public.ts`) y
  administrativo con service role marcado `server-only` (`lib/supabase/admin.ts`,
  listo para fases 3 y 6, sin usar aún).
- **`.env.example`** con todo lo necesario. `.env.local` (con las claves reales que me
  pasaste) creado y **gitignored** — no se versiona.
- **Tokens de diseño completos** en `app/globals.css`, incluidos `--success` y `--warning`
  (no vienen en shadcn), más los de tipografía, forma, espacio y marca de `docs/02`.
  `tailwind.config.ts` los consume (`success`, `warning`, fuentes, radios).
- **Inyección de tema validada**: `lib/theme/tokens.ts` (lista blanca + validadores por
  tipo), `lib/theme/serialize.ts` (serializa a `:root{...}` descartando lo inválido) y
  `lib/theme/config.ts` (lee la empresa activa). El layout raíz inyecta el `<style>` ya
  saneado. Sin esto sería un vector de inyección de CSS.
- **`/api/keepalive`**: llama `ping()` por RPC con la anon key, responde 200/502/500 con
  JSON. Documentado cómo conectar el cron externo (README).
- **Banner de demostración** (`components/banner-demostracion.tsx`): lo controla la
  columna `empresas.banner_demo`, leída vía `config_publica`. Solo colores de token.
- **Página de inicio** y layout raíz con fuentes (`next/font`: Inter + Plus Jakarta Sans).

### Verificación hecha

- `npm run typecheck` → limpio.
- `npm run build` → 4 rutas compilan (`/`, `/_not-found`, `/api/keepalive`).
- Servidor de dev contra el proyecto real (aún sin tablas): `/` responde 200 y muestra el
  banner + los 4 espacios; `/api/keepalive` responde 502 porque `ping()` todavía no existe
  en la BD (esperado hasta correr el SQL).

### Decisiones tomadas

1. **Tailwind v3 + shadcn clásico** (no v4). Coincide con `docs/02` (variables HSL por
   canal, `tailwind.config` extensible) y es lo más estable para el plazo.
2. **Registro npm**: el `~/.npmrc` global apunta a un Artifactory corporativo
   (`af.hikvision.com.cn`) que ahora no resuelve. Agregué un **`.npmrc` de proyecto** que
   apunta al registro público de npm. Es local a esta carpeta y reversible (borrar el
   archivo). Si tu política corporativa exige el Artifactory, avísame y lo revierto.
3. **Banner** → columna real `empresas.banner_demo` en `01-schema.sql` (tu corrección).
   Nada de variable de entorno temporal.
4. **Keepalive** → función `ping()` `SECURITY DEFINER` + `grant a anon`, llamada por RPC
   con la anon key (tu corrección). No toca RLS, no usa service role.
5. **`config_publica(p_slug)`** (añadido mío, **aprobado**): el layout necesita leer
   tema + marca + `banner_demo` para visitantes **anónimos** (la página de `/acceso`
   también va temada). Mismo patrón que `ping()` (`SECURITY DEFINER` + `grant a anon`),
   así se evita la service role key en el cliente y no hay que abrir políticas RLS.
   **Acotada por revisión de Sebastián**: al ser una ruta pública que recibe un slug,
   devuelve solo lo mínimo para pintar el login — `marca_nombre`, `banner_demo` y
   `tokens` (el logo vive dentro de los tokens). Ya NO devuelve `empresa_id` ni `slug`
   ni ningún dato de negocio (nit, fechas, evento), para que no se pueda enumerar slugs
   y extraer más que la marca visible de cada cliente cuando haya varias empresas.
6. **Ventana del seed** corregida a `2026-09-01` → `2026-12-10` (tu corrección). La
   validación de ventana se implementa en Fase 2.
7. **Revalidación del layout**: `revalidate = 300` (5 min) para reflejar cambios de tema y
   banner sin redeploy, manteniendo las páginas casi estáticas.

### Base de datos aplicada — ✅ (2026-09-02)

El SQL se aplicó con `scripts/setup-db.mjs` (conexión directa por Postgres, service key
NUNCA hardcodeada; cadena en `.env.local` como `SUPABASE_DB_URL`, gitignored). El script:
corre los 4 archivos en orden, para en el primer error, y es reejecutable (teardown
`drop if exists` + seed que borra antes de insertar → dos corridas dejan el mismo estado,
verificado). `npm run db:setup`.

Verificación (ambas corridas): colaboradores=25, beneficiarios=40, productos=36, empresa
`acueducto` presente, `ping()` responde, `config_publica('acueducto')` responde con los 3
campos mínimos. **`GET /api/keepalive` → 200** `{ok:true, ping:...}` (ya no 502).

### Pendiente / lo que necesito de ti

- [ ] **Crear los usuarios de Supabase Auth** (colaboradores con correo sintético
  `{cedula}@acueducto.interno` + `codigo_sap`; y los usuarios admin/empresa/operario/dev).
  Se aborda en la Fase 1 (con la service role key desde un script local, no a mano).
- [ ] Montar el **cron externo** al `/api/keepalive` cada 24 h antes de entregar (README).

### Nota operativa (mezcla build + dev en Windows)

`next build` (producción) y `next dev` comparten la carpeta `.next`. Alternarlos dejó un
chunk colgante (`Cannot find module './301.js'`) y una vez un `next dev` huérfano ocupando
el puerto. Solución: `rm -rf .next` antes de cambiar de modo, y matar el proceso del puerto
si quedó vivo. No es un bug del código; el keepalive da 200 en un server limpio.

---

## Fase 1 · Autenticación y los cuatro espacios (+ /dev) — ✅ Completada (2026-09-02)

### Qué quedó hecho

- **Cinco espacios, cada uno con su login y su layout propio**: `/acceso` (colaborador,
  cédula + código SAP), `/kidotoy`, `/empresa`, `/entrega` (correo + contraseña) y `/dev`
  (oculto, `admin_dev`, `noindex`, sin enlaces en la interfaz).
- **Correo sintético** del colaborador: `{cedula}@acueducto.interno`, contraseña = código
  SAP. El usuario solo escribe cédula y código.
- **Control de intentos** (reglas en la memoria del proyecto `control-intentos-acceso`):
  cuenta solo por cédula vía `verificar_intentos()` (ventana deslizante 15 min, 5 fallos);
  IP solo a auditoría; **mismo mensaje genérico siempre, incluido durante el bloqueo**;
  registro del resultado real garantizado e inmutable (`registrar_intento_acceso`, nueva
  función SECURITY DEFINER + grant anon en `03-funciones.sql`).
- **Middleware** (`middleware.ts`): protege cada zona por `rol` de `app_metadata`,
  refresca sesión (`getUser`), y redirige (a login si falta rol; a su home si ya está
  logueado; a la home de su rol si entra a otra zona). Excluye `/api` y assets.
- **Provisión de usuarios de Auth** con `scripts/setup-auth.mjs` (`npm run db:auth`,
  service role solo del entorno, idempotente por correo): 25 colaboradores enlazados a
  `auth_user_id` + 4 usuarios de personal.

### Verificación hecha

- `npm run typecheck` y `npm run build` limpios (14 rutas + middleware 93 kB).
- **Middleware en vivo**: las 5 rutas protegidas → 307 a su login; home + 5 logins +
  keepalive → 200.
- **Credenciales/roles en vivo** (Supabase REST): colaborador estrella entra con
  `app_metadata {empresa_id, rol:colaborador}`; admin entra con `rol:admin_kidotoy`;
  contraseña equivocada → `invalid_credentials`.
- **Lockout en vivo** (RPC anon): `verificar_intentos` pasa de `true` a `false` tras 5
  fallos sobre la misma cédula.

### Decisión marcada (control de intentos)

Implementé el registro del intento con su **resultado real**, garantizado por `try/catch`,
en lugar del literal "insertar falso antes de validar". Razón: un fallo grabado debe ser
**inmutable**; si `registrar_intento_acceso` pudiera voltear un fallo a éxito desde anon,
un atacante limpiaría su propio historial y burlaría el bloqueo. Y dejar un "falso" previo
sin voltear auto-bloquearía a un colaborador que entra bien varias veces (el evaluador del
piloto). El objetivo de tu instrucción (nada de reintentos gratis ante excepción) queda
cubierto porque el registro **siempre** corre. Sebastián: aprobado en el chat.

### Credenciales de demostración (datos ficticios)

- Colaborador estrella: cédula **52318904** · código **SAP-007340** (3 hijos: 3, 7, 12).
- `admin@kidotoy.local` / `Kidotoy#2026` · `rrhh@acueducto.local` / `Acueducto#2026`
- `entrega@kidotoy.local` / `Entrega#2026` · `dev@kidotoy.local` / `DevKidotoy#2026`

### Pendiente

- Los espacios muestran un placeholder tras el login; su contenido llega en su fase
  (2 colaborador, 3 Kidotoy, 4 empresa/entrega, 5 dev).

---

## Fase 2 · Portal del colaborador — ✅ Completada (2026-09-02)

### Qué quedó hecho

- **Mis beneficiarios** (`/acceso/inicio`): tarjetas con estado diferenciado (icono +
  texto, no solo color). Pendiente → "Elegir regalo"; Confirmado → juguete + código de
  entrega + "Ver comprobante". Mensaje de cierre cuando todos están confirmados. Estado
  vacío resuelto.
- **Catálogo** (`/acceso/beneficiario/[id]`): las **6 referencias de la edad EXACTA y el
  género** (nunca por rango). Agotados **deshabilitados con etiqueta "Agotado"**, no se
  ocultan. Disponibilidad en vivo con **Realtime** sobre `productos` (cosmético).
- **Confirmación** (`.../confirmar/[producto]`): pantalla intermedia con advertencia
  clara de irreversibilidad. Confirma **siempre** vía `supabase.rpc('confirmar_seleccion')`
  — nunca se lee stock ni se decide en el cliente. Mensajes en español para `SIN_STOCK`
  (volver al catálogo), `YA_TIENE_SELECCION` (ir a la lista) y `FUERA_DE_VENTANA`.
- **Comprobante** (`.../comprobante`): beneficiario, juguete, código grande, **QR**
  (generado en servidor con `qrcode`), fecha y lugar del evento. **No caduca**: se lee sin
  importar la ventana.
- **Validación de ventana** (las 4 precisiones): fuera de ventana el catálogo se ve pero
  el botón de confirmar queda **deshabilitado con mensaje de "desde cuándo"**; la ventana
  se valida **también en `confirmar_seleccion()`** (nueva rama `FUERA_DE_VENTANA`); quien
  ya confirmó conserva su comprobante; fechas desde `empresas.ventana_inicio/fin`, nunca
  en código (`lib/campana/ventana.ts`).

### Bug encontrado y corregido (afecta también producción)

`confirmar_seleccion()` fallaba con `gen_random_bytes(integer) does not exist`. En Supabase
`pgcrypto` vive en el esquema `extensions`, pero la función fijaba `search_path = public`.
Corregido a `set search_path = public, extensions`. Sin esto, **ninguna** confirmación
funciona en Supabase. Lo detectó la prueba end-to-end.

> **DECISIÓN PERSISTENTE — no revertir.** Cualquier función `SECURITY DEFINER` que use
> `gen_random_bytes` / `gen_random_uuid` u otra de pgcrypto DEBE llevar
> `set search_path = public, extensions` en Supabase, porque pgcrypto vive en el esquema
> `extensions`, no en `public`. Aplica hoy a `confirmar_seleccion`. Si alguien reescribe la
> función y deja solo `= public`, vuelve a romperse en tiempo de ejecución (no lo cacha el
> typecheck ni el build; solo una confirmación real).

### Verificación hecha

- `typecheck` + `build` limpios (rutas del colaborador dinámicas).
- **Flujo completo end-to-end** con tokens reales (colaborador 52318904 + admin) y
  limpieza: catálogo de 6 por edad/género exactos → `confirmar_seleccion` 200 (código,
  stock 12→11) → segundo intento `YA_TIENE_SELECCION` → comprobante legible →
  `liberar_seleccion` (admin) restaura stock y deja la base **limpia**.
- Nueva dependencia aprobada: `qrcode` (QR del comprobante, generado en servidor).

### Nota operativa importante

`npm run db:setup` re-siembra `colaboradores` y por eso **borra `auth_user_id`**. Hay que
correr `db:auth` después. Se agregó **`npm run db:reset`** que hace ambos en orden. Usar
siempre `db:reset` al reconstruir la base.

---

## Fase 3 · Panel de Kidotoy — ✅ Completada (2026-09-02)

### Qué quedó hecho

- **Resumen** (`/kidotoy/panel`) organizado por las **tres preguntas diarias**: ¿cuánto
  falta? (avance %, confirmados, pendientes, barra), ¿qué se agota? (agotadas + por
  agotarse <20%, con enlace a inventario), ¿quiénes no han entrado? (colaboradores con
  hijos sin elegir, ordenados por pendientes).
- **Selecciones** (`/kidotoy/selecciones`): tabla densa filtrable por edad, género, área,
  estado y búsqueda; **exportable a CSV** (`/kidotoy/selecciones/export`, mismos filtros
  vía helper compartido `filtros.ts`).
- **Inventario** (`/kidotoy/inventario`): resumen por edad/género (vista
  `v_inventario_por_grupo`) + tabla de referencias con **edición de stock** (diálogo) y
  registro en auditoría.
- **Liberar** (`/kidotoy/liberar`): buscador de selecciones confirmadas + diálogo con
  motivo obligatorio y aviso de que queda en auditoría a nombre del admin.
- **Catálogo** (`/kidotoy/catalogo`): alta y edición de referencias (diálogo único),
  ambas auditadas.

### Precisiones aplicadas (las 4)

1. **Piso de stock = consumido**, garantizado en la base (`actualizar_stock`, nueva
   función con `SELECT ... FOR UPDATE` que serializa contra `confirmar_seleccion`). No se
   puede fijar un total menor que lo ya confirmado; el disponible se recalcula.
2. **Motivo de liberación >= 10 caracteres** (subido de 5 a 10 en `liberar_seleccion`), y
   la interfaz muestra que queda registrado a nombre del admin (su correo) con el texto.
3. **Resumen = las tres preguntas** y nada más.
4. **CSV para Excel-es**: punto y coma, UTF-8 con BOM, fechas DD/MM/AAAA (`lib/csv.ts`).

### Funciones nuevas en la base (auditadas, admin-only)

`actualizar_stock`, `crear_producto`, `actualizar_producto`. Se hicieron como funciones
(no UPDATE directo) porque toda mutación relevante debe quedar en `auditoria`, y el rol
autenticado no tiene política de insert sobre esa tabla (solo las funciones SECURITY
DEFINER escriben ahí).

### Verificación hecha

- `typecheck` + `build` limpios (rutas del panel + export CSV).
- **15 checks end-to-end con tokens reales** (admin + colaborador) y limpieza total:
  piso de stock (rechaza bajar de consumido, sube preservando consumido, baja al mínimo),
  motivo <10 rechazado ("test", "."), liberar válido + motivo en auditoría, colaborador
  no puede `actualizar_stock` (NO_AUTORIZADO), crear/duplicado/editar catálogo. Base
  quedó intacta (0 selecciones, 36 productos, stocks restaurados).
- **CSV verificado ejecutando el helper real**: BOM, `;`, DD/MM/AAAA, entrecomillado de
  valores con `;`, CRLF.

---

## Datos de demostración cargados (2026-09-02)

`npm run db:demo` dejó la base en un "caso realista" para mostrar: 27/40 confirmados
(67.5%), 1 referencia agotada (REF-03N3, puesta a 0 vía admin) y 1 por agotarse, 9
colaboradores pendientes. **El colaborador estrella 52318904 quedó intacto (3 hijos
pendientes)** para demostrar el flujo de selección. No destructivo y reejecutable.
Volver a cero: `npm run db:reset`.

---

## Fase 4 · Portal del Acueducto y módulo de entrega — ✅ Completada (2026-09-02)

### /empresa (solo lectura)

- Avance (mismas stat cards), **alerta de referencias agotándose solo como conteos**
  (sin stock detallado, sin nada de negocio) y tabla de **colaboradores pendientes**.
- **Sin ningún control de acción**: no hay botón (ni deshabilitado) de editar, liberar o
  inventario. Si no puede, no aparece (precisión 1).
- **CSV** con el mismo formato Excel-es; se omitió la columna "código de entrega" (es el
  token de reclamo, no un dato de reporte para RRHH). **Cero columnas de negocio** —
  costos/precios/márgenes no existen en el modelo (precisión 2).

### /entrega (de pie, una mano, al sol)

- Búsqueda por **código o cédula** + **escaneo de QR con cámara** (dependencia aprobada
  `html5-qrcode`, carga dinámica para no tocar SSR, con fallback a entrada manual).
- Ficha: nombre grande, edad, **carpa** (= edad), juguete + foto, botón enorme.
- **Confirmación de éxito a pantalla completa** (precisión 4): fondo `--success`, check
  gigante, nombre del beneficiario a 5xl, y un solo botón "Siguiente" que reinicia. Un
  toque para pasar al siguiente.
- **Aviso "ya fue entregado" a pantalla completa** (precisión 5): fondo `--destructive`,
  con **hora y operario anterior**, imposible de pasar por alto.
- Contador de la jornada siempre visible; entrega siempre vía `registrar_entrega()`.

### Verificación hecha

- `typecheck` + `build` limpios; rutas y protección por middleware probadas en vivo
  (logins 200; paneles y export CSV → 307 sin sesión).
- **10 checks end-to-end con tokens reales** (operario + empresa) y limpieza: empresa NO
  puede liberar ni actualizar stock (`NO_AUTORIZADO`); búsqueda por cédula; registrar
  entrega (1ª vez ya_entregado=false + carpa); 2ª vez ya_entregado=true **conservando
  operario y hora anteriores**; código inexistente → `CODIGO_NO_EXISTE`. Base limpia.

### Dependencia nueva (aprobada)

`html5-qrcode` para el escaneo de QR con cámara del módulo de entrega.

---

## Fase 4.1 · Separación operar/gestionar entregas — ✅ (2026-09-02)

Ajuste de arquitectura pedido por Sebastián: `/entrega` solo OPERA; la gestión de la
jornada vive en `/kidotoy`.

### /entrega (sigue siendo la pantalla más tonta y rápida)

- Único cambio: la **carpa se muestra destacada** (banner grande con color de marca) en la
  ficha, para que el operario note de inmediato si el niño va a otra carpa y redirija a la
  familia — **sin que el sistema lo bloquee** (cualquiera escanea cualquier código).

### /kidotoy → nueva sección "Entregas"

- Avance total y **avance por carpa** (con pendientes por carpa para mandar refuerzo).
- **Últimas entregas** con operario y hora.
- **Búsqueda** de beneficiario y su estado de entrega (filtros carpa/estado).
- **Exportación** del consolidado (mismo formato Excel-es).
- **Reversión** de una entrega marcada por error: `revertir_entrega` (admin-only, motivo
  >= 10, auditoría), igual que liberar. Devuelve la selección a "sin entregar".

### Concurrencia (mejora + verificación)

`registrar_entrega` ahora maneja `unique_violation`: si dos operarios escanean el mismo
código a la vez, el `unique` sobre `seleccion_id` deja pasar solo un insert (**nunca dos
éxitos**) y el perdedor recibe **"ya entregado"** (antes recibía un error crudo).

Verificado con **6 llamadas simultáneas** al mismo código: exactamente 1 éxito, 5 "ya
entregado", 0 errores, 1 sola fila en la base, y todos los perdedores reportan al operario
ganador. Reversión probada: empresa no puede (NO_AUTORIZADO), motivo <10 rechazado, admin
revierte con auditoría, re-registro posterior OK. Base restaurada.

### Datos de demo

`db:demo` ahora también registra ~40% de entregas (jornada en curso, varios operarios):
28/40 confirmadas, 12 entregadas repartidas 4/4/4 por carpa (3/7/12), REF-03N3 agotada,
estrella 52318904 intacto.

---

## Fase 5 · Panel de temas (/dev/tema) — ✅ Completada (2026-09-02)

### Auditoría previa (precisión 1)

- **Colores: cero hardcodeados** en las 4 fases. Todo por tokens. Promesa intacta.
- **Corregido:** `rounded-xl` (Card de shadcn + banner de carpa) era un valor FIJO de
  Tailwind, no derivado de `--radius`. Se mapeó `xl`/`2xl` a `--radius` en el config.
- **Corregido (tokens muertos):** `--font-scale`, `--spacing-unit`, `--density`,
  `--shadow-level` estaban definidos pero nada los consumía. Se cablearon en
  `tailwind.config.ts`: escala tipográfica geométrica, escala de espaciado
  (`spacing-unit × density`) y sombras (alpha desde `shadow-level`). A valores por
  defecto renderizan idéntico; solo cambian al mover el control. Verificado en el CSS
  compilado (`.rounded-xl→calc(var(--radius)+4px)`, `.p-4→calc(var(--spacing-unit)*4*
  var(--density))`, `.text-xl→calc(1rem*var(--font-scale)...)`, `.shadow→...var(--shadow-level)`).
- **Excepción intencional:** el QR usa `#000/#fff` fijos (un QR con color de tema no se
  escanea).

### Panel

- Controles a la izquierda, **vista previa en vivo** a la derecha con componentes reales
  (tarjeta de juguete, beneficiario confirmado, alerta de error, fila de tabla, encabezado
  con logo, botón principal). En angosto, apila.
- Selectores de color con hex + conversión a HSL, **"generar variantes"** (deriva los
  `*-foreground` legibles y ata el foco al primario), fuentes de la lista curada,
  deslizadores de tamaño base/escala/radio/espaciado, densidad, sombra, peso de títulos,
  URLs de logo/favicon, y alternar claro/oscuro.
- **Guardar explícito** (precisión 2): la preview cambia en vivo pero nada toca la BD
  hasta guardar; aviso `beforeunload` si sales con cambios sin guardar.
- **Restablecer con confirmación** (precisión 3): único botón que destruye trabajo.
- Exportar/Importar JSON. Verificación de contraste que **avisa < 4.5:1 sin bloquear**.

### Verificación end-to-end (precisión 4)

Escribí un tema muy distinto (primario naranja `18 95% 54%`, fuentes Outfit/Manrope, radio
16px), y verifiqué que la inyección validada llega a **los cuatro espacios** (comparten el
layout raíz): el `<style>:root{}` de `/acceso`, `/kidotoy`, `/empresa` y `/entrega` trae
`--primary`, `--radius:16px`, `--font-heading:var(--font-outfit)`, `--font-body:var(
--font-manrope)`. Ninguna pantalla se quedó con el estilo viejo (no hay valores a mano; el
`rounded-xl` ya deriva de `--radius`). Tema restablecido a vacío tras la prueba.

### Fuentes

Se cargan 7 fuentes curadas con `next/font/google` (variables CSS); solo se **precargan**
las 2 por defecto, el resto baja cuando el tema la usa. **Geist se omitió**: no está en
`next/font/google` (requiere el paquete `geist`). Si se quiere, agregarlo es una decisión
de dependencia — ver pendientes.

---

## Fase 6 · Correo y cierre — ✅ Completada (2026-09-02)

### Correo (Resend)

- Cliente por API REST (`lib/email/resend.ts`, **sin dependencia**, vía fetch). **Nunca
  lanza**: devuelve `{ok:false}` ante cualquier fallo (precisión 3).
- **Correo de confirmación** (`lib/email/confirmacion.ts`): se dispara cuando el
  colaborador completa a TODOS sus hijos, con juguete + código de cada uno + fecha/lugar.
  Enganchado en el action de confirmación **best-effort**: si Resend falla, la selección
  ya quedó y el comprobante está en pantalla; el correo nunca rompe el flujo (verificado:
  el envío está envuelto y su resultado se ignora).
- **Resumen diario** (`app/api/resumen-diario/route.ts`): avance, confirmados del día,
  agotadas/por agotarse, colaboradores pendientes. Protegido por `CRON_SECRET`; usa service
  role SOLO tras validar el secreto.
- **Plantillas** (`lib/email/plantillas.ts`): HTML email-safe (tablas + estilos inline, sin
  `<style>` ni recursos externos). El de confirmación es **imprimible en B/N**: códigos en
  cajas con borde negro + monospace grande, legibles sin color (precisión 2). Incluyen
  versión de texto plano.

### Envíos reales probados (con dominio vaisy.app del usuario)

- Resumen diario por la **ruta real** → Resend `id e45ace6a…` (HTTP 200).
- Confirmación con los 3 códigos del estrella → Resend `id c3da10dd…` (HTTP 200).
- **Pendiente del usuario:** abrir ambos en Gmail/Outlook y revisar spam (no puedo ver la
  bandeja). Previews HTML en `demo/`.

### Bug encontrado y corregido: Realtime no entregaba (precisión 4)

El catálogo NO se actualizaba en vivo. Causa: el socket de Realtime del navegador conecta
como **anónimo** y `prod_lectura` (RLS) exige empresa autenticada, así que Postgres no
entregaba ningún evento. Fix: pasar el JWT de la sesión al socket
(`supabase.realtime.setAuth(token)`) antes de suscribir, en `components/colaborador/
catalogo.tsx`. Verificado en navegador: el card pasa a "Agotado" **solo, en ~1 s, sin
recargar**. (El spec dice que Realtime es cosmético; aun así ahora funciona.)

> **DECISIÓN PERSISTENTE — no quitar.** En `components/colaborador/catalogo.tsx`, la línea
> `supabase.realtime.setAuth(session.access_token)` antes de `.subscribe()` es
> IMPRESCINDIBLE. Sin ella el socket de Realtime conecta como anónimo, RLS bloquea todos
> los eventos y el catálogo deja de actualizarse en vivo **sin ningún error visible**. Es
> exactamente el tipo de línea "aparentemente redundante" que alguien limpia sin saber para
> qué está. Este bug solo se manifiesta en navegador real con sesión (no lo cachan
> typecheck, build, ni las pruebas por API), y aparecería el día pico frente al cliente.
> Ver la memoria del proyecto `realtime-necesita-jwt`.

### Prueba de dos pestañas — en navegador real (Playwright, precisión 4)

Dos colaboradores distintos (12-Niño), una unidad, confirmar casi al tiempo:
- **Exactamente un ganador** → comprobante. El segundo se queda en la pantalla de
  confirmación con el mensaje **"Este juguete se agotó mientras lo elegías. Por favor
  selecciona otro."** y el botón cambia a "Volver al catálogo".
- Al volver (navegación de la app, **sin recargar**), el balón aparece **"Agotado"** y
  puede elegir otro. Capturas en `demo/`/scratchpad.

### Recorrido móvil — en emulación (precisión 5)

**No es teléfono físico** (no tengo uno): es emulación de dispositivo (390×844) con
Playwright. Sin desbordamiento horizontal en ninguna de las 4 pantallas (las tablas densas
scrollean dentro de su contenedor). `/entrega` en móvil se ve como debe: nombre grande,
"CARPA 3" destacada, botón enorme; y la pantalla de éxito a pantalla completa. Capturas en
scratchpad. **Sugerido: que el usuario haga el recorrido físico real** de `/acceso` y
`/entrega`.

### Video del recorrido del colaborador (52318904)

Grabado con Playwright (viewport móvil), login → 3 catálogos → confirmar → comprobante ×3:
`demo/recorrido-colaborador-52318904.mp4` (y `.webm`). El flujo completó a los 3 hijos y
disparó el correo de confirmación real. Tras grabar, el estrella se restauró a **pendiente**
(via `db:reset`+`db:demo`) para la demostración en vivo.

---

## Fase 7 · Carpas configurables y operarios por punto — ✅ Completada (2026-09-02)

Cambio de criterio: la carpa ya no es la edad (el juguete físico está en un punto, no en
una edad). Ver `docs/03-guia-de-pantallas.md`.

- **Modelo**: tablas `carpas`, `carpa_referencias` (asignación por referencia, una carpa
  por referencia) y `operarios` (cuenta ↔ carpa). `entregas` pasó de `carpa int` a
  `carpa_id` + `operario_carpa_id` + `fuera_de_carpa`.
- **Configuración de carpas** (`/kidotoy/carpas`): crear/renombrar/eliminar carpas, asignar
  cada referencia a una carpa, y **alerta destacada** de referencias sin carpa (nadie
  podría entregarlas). Migración por defecto: 14 carpas (una por edad 0–13) con sus
  referencias asignadas.
- **Operarios** (`/kidotoy/operarios`): crear cuentas de operario desde el panel (usa la
  service role tras validar que quien llama es admin) y editar su carpa. **Subido de
  pendiente de producción a ahora.**
- **Comportamiento al escanear** (`registrar_entrega` reescrita): la carpa de la entrega es
  la de la referencia. Si el operario está en la carpa correcta → verde "es aquí". Si es
  otra → aviso grande con la carpa correcta, **sin bloquear** (queda `fuera_de_carpa`). Si
  no tiene carpa → aviso, tampoco bloquea. El operario ve **siempre** su carpa en pantalla.
- **Avance por carpa** usa las carpas configuradas (no la edad) + contador de "fuera de
  carpa".

Verificado: `typecheck` + `build` limpios; 8 checks end-to-end con tokens reales (operario
lee su carpa; juguete de su carpa → dentro; de otra carpa → no bloquea, `fuera_de_carpa`,
nombra la carpa correcta; sin carpa → no bloquea; referencia desasignada aparece en la
alerta; limpieza). Screenshot móvil del caso "otra carpa" confirmado (aviso grande + botón
Marcar entregado presente). Demo re-generado (12 entregas, 2 fuera de carpa).

---

## Fase 8 · Identidad visual y pulido — 🔧 En curso

Vestir la plataforma con la identidad Acueducto/Kidotoy de `docs/diseno/`. No cambia
ninguna regla de negocio. Los mockups definen los **valores por defecto de los tokens**.

### 8.1 · Tokens y base — ✅ (2026-09-02)

- **Paleta** de los mockups como valores por defecto en `globals.css` (y en sincronía en
  `lib/theme/defaults.ts`, para que "restablecer" del panel vuelva a estos): primario
  #007BFF, secundario/acento azul claro #E7F5FF, texto #1F2937/#687280, superficies
  #F5F7FA, bordes #E5E7EB, destructivo #FF4D4F, éxito #22C55E, advertencia #F59E0B.
- **Tipografía**: **Montserrat** para títulos (agregada a la lista curada del panel y
  precargada), **Inter** para cuerpo. Radio 0.75rem (generoso), sombras suaves y difusas
  (tono azulado, radios de desenfoque amplios), todo derivado de `--shadow-level`.
- **Logo**: componente `MarcaKidotoy` (wordmark colorido con corona) + `LockupMarca`
  (acueducto | kidotoy), en login y landing. Sus colores son **fijos a propósito**
  (identidad de marca, excepción como el QR: un logo no se recolorea con el tema).
- **Verificado**: `typecheck` + `build` limpios; auditoría de tokens **sin colores
  hardcodeados** (el único hex inline es el logo, excepción documentada). Screenshot del
  login confirma la nueva identidad.

> **NOTA (sustitución de fuente):** los mockups piden **Helvetica Neue** para el cuerpo,
> que **no está en Google Fonts**. Se sustituyó por **Inter** (la más cercana disponible,
> ya en la lista curada del panel), como indicó Sebastián.

> **Pendiente de asset:** el logo oficial **vectorial** de Kidotoy y el de **Acueducto**
> (rana + "Agua y Alcantarillado de Bogotá") los debe entregar el cliente. Hoy Kidotoy es
> un wordmark propio y Acueducto va como texto de marcador.

### 8.2 · Componentes compartidos — ✅ (2026-09-02)

- **Botones**: 4 variantes (primario sólido, secundario contorno azul, terciario texto,
  destructivo) con sus estados (hover, focus-visible con ring+offset, active, disabled,
  loading), radio generoso, sombra suave.
- **Inputs**: 44px, radio generoso, borde+ring azul al enfocar.
- **Alertas**: suaves y tintadas, 4 tipos (info/éxito/advertencia/error) con ícono en color.
- **Chip de estado** (`ChipEstado`): disponible/últimas/agotado/confirmado/pendiente/
  entregado, con **ícono + texto** (nunca solo color).
- **Avatar de iniciales** (`AvatarInicial`): color estable por nombre, **sin fotos de
  menores** (regla #2). Excepción de color documentada, como el logo.
- **Skeletons** para beneficiarios, catálogo, tablas y métricas.
- Tarjetas de **producto** y **beneficiario** refactorizadas a estos componentes.
- Verificado: `typecheck` + `build` limpios; **sin colores hardcodeados** (solo logo y
  avatar como excepciones inline). Screenshots del catálogo y beneficiarios confirman la
  identidad.

### Logos oficiales

Reemplazado el wordmark propio por los PNG oficiales en `public/logos/`. Componente con
fuente única (swappable a vector), slot de modo oscuro (hoy = mismo archivo) y tope de
tamaño para Acueducto (baja resolución, 500×124). Lockup acueducto | kidotoy en login y
encabezado del colaborador; solo Kidotoy en el panel. **Pendiente:** vectoriales oficiales.

### Repositorio

Subido a **github.com/Naanita/Kidotoy-masive** (rama main). `.env.local` y secretos NO
versionados (verificado); `.env.example` solo con placeholders.

### 8.3 · Rediseño con dirección de Stitch — espacio del colaborador ✅ (2026-09-03)

Fuente de verdad: **DESIGN.md** (raíz). El HTML de Stitch NO estaba en el repo (solo llegó
DESIGN.md); se usó DESIGN.md + los 4 mockups + la lista explícita de "lo que sí quiero".

- **Fundación de tokens a DESIGN**: fondo blanco dominante, texto #333, borde #EDEDED,
  advertencia #F4A612 y error #E23C3D (Kidotoy). Colores de marca Kidotoy como variables
  fijas (`--kido-*`, `--primary-dark/deep`), no en el panel de temas (como el logo). Radios
  8px botones / 12px tarjetas, sombras azuladas (#0B3A78) suaves derivadas de `--shadow-level`.
  `globals.css` y `defaults.ts` sincronizados; `prefers-reduced-motion` global.
- **Fredoka** cargada (next/font) para momentos de alegría (`font-display`): saludo,
  títulos de catálogo, nombres de juguete, pantalla de éxito. Montserrat títulos, Inter cuerpo.
- **Toasts** (sonner) según DESIGN: blanco, borde izquierdo semántico, ícono, arriba-derecha
  en escritorio / arriba-centro en móvil, autocierre ~4.5 s. Disparan "Sesión iniciada"
  (login) y "Código copiado" (comprobante). Errores de formulario siguen pegados al campo.
- **Espacio del colaborador**: stepper de 4 pasos (Beneficiarios→Elegir→Confirmación→
  Comprobante), catálogo 2 col móvil / 3 escritorio con chip flotante, indicador en vivo
  (punto pulsante), tarjeta agotada (imagen al 45% + chip rojo + botón deshabilitado, nunca
  oculta), aviso de confirmación con borde izquierdo, comprobante con Fredoka + código en
  grupos + botón copiar + celebración. Skeletons de carga.
- **Rechazado de los mockups/Stitch** (no construido): añadir hijo, fotos de menores,
  recordar datos, navegación inferior/menús inventados, campana, chips Premium, superposición
  "sin cupos", pie con Términos, su paleta, rangos de edad, datos falsos (Carlos Mendoza,
  2024, Simón Bolívar). Datos reales de la base.
- **Bug corregido**: la fecha del evento salía un día antes (fecha "solo día" parseada como
  UTC, zona -5 rodaba al día anterior). `formatearFecha` la ancla al mediodía.
- Sin lógica de negocio tocada. `typecheck` + `build` limpios, tokens sin hardcodear.
  Verificado en pantalla el flujo completo del colaborador.

### Pantallas de los mockups que NO se construyen sin confirmación (regla #6)

Gráficas del panel (incl. "inventario por categoría" — no existe el campo categoría);
campana de notificaciones y feed de actividad reciente; "historial de entregas" del
operario; capacidad por carpa (no existe el campo); paginación de tablas. Pendiente de
decisión de Sebastián.

### 8.7 · Portal del Acueducto y accesos ✅ (2026-09-04)

- **Portal `/empresa`** rediseñado con **marca Acueducto dominante** y **Kidotoy como firma
  discreta** al pie ("Programa de bienestar operado por Kidotoy"); registro intermedio (más
  aire que el panel de Kidotoy). **Resumen ejecutivo**: métricas sobrias + **gráfica de
  evolución** de confirmaciones + barra de cobertura + alerta de disponibilidad **solo con
  conteos** (sin stock, sin nada de negocio). **Colaboradores pendientes** con **exportación
  CSV** (nueva ruta `/empresa/pendientes/export`, sin código de entrega) y **estado vacío**
  ("No queda nadie pendiente").
- **Solo consulta reforzado**: no aparece ningún control de acción (liberar/editar/inventario),
  ni deshabilitado; la tabla de Selecciones va **sin columna Código** y su CSV tampoco lo lleva.
- **Tres logins diferenciados** (`PantallaLoginAdmin`, variantes `kidotoy`/`acueducto`/
  `operario`): misma estructura, marca de cada espacio. El de operario con **campos y botón
  más grandes** (se usa en el celular al aire libre). Estados de error y de carga en las tres.
- **Bug de copy corregido:** los tres logins de correo reusaban el mensaje de error del
  colaborador ("Verifica tu documento y tu código"), que no aplica a un acceso de correo +
  contraseña. Nuevo `MENSAJE_ACCESO_CORREO_GENERICO` ("Verifica el correo y la contraseña"),
  **igual de no-revelador** (no dice cuál campo falló ni si el correo existe).
- **`/dev`: NO se rediseñó**, por decisión de Sebastián (herramienta interna, no la ve el
  cliente). Queda funcional como estaba.

### 8.8 · Módulo de entrega y repaso final ✅ (2026-09-04)

- **`/entrega` rediseñado a la densidad más baja del sistema** (de pie, al sol, una mano,
  cientos de veces al día): **escaneo como acción principal** (botón hero enorme), campo de
  búsqueda como alternativa (sin autofocus para no tapar el escáner con el teclado), tipografía
  enorme, objetivos táctiles ≥44px, foco visible, e identidad Kidotoy discreta (franja). Un
  **sistema de color semántico** legible a un metro: azul marino = tu carpa (contexto), azul =
  escanear (acción), verde = adelante/entregado, rojo = alto/ya entregado, amarillo = ojo, va a
  otra carpa (**no bloquea**). Escanear un código **ya entregado** ahora va **directo a la
  pantalla roja completa** (con hora + operario anterior), no a un bloque dentro de la ficha.
  Sin tocar lógica: todo sigue por `registrar_entrega()`.
- **Gráfica del panel viva (seed):** `db:demo` ahora **reparte `confirmada_en` en ~13 días**
  con una curva realista (arranque bajo, pico tras el "comunicado de RH", goteo hasta hoy).
  Antes `confirmar_seleccion()` sellaba todas con `now()` y la gráfica de evolución se veía como
  **un solo punto** (roto, aunque correcto). **No se tocó el componente** de la gráfica, solo
  cómo se siembran las fechas. Se ve en `/kidotoy` y `/empresa`.
- **Prueba del tema (la que importa):** desde `/dev/tema` se cambió el primario (magenta), dos
  fuentes y el radio (20px) y se recorrieron los cuatro espacios. **Propaga a todos** (botones,
  chips, barras de estado, stepper, progreso, gráfica, enlaces, foco, radios, fuentes). Lo que
  **no cambia es marca a propósito**: la franja `--kido-*`, el marino `--primary-deep` (barra
  lateral admin, barra "Tu carpa" de entrega, banda del login Kidotoy) y la display Fredoka.
  - **Brecha encontrada y corregida:** `--primary-dark` —el **hover de los botones primarios**—
    era un azul fijo (#1361C5) que **no seguía** al primario re-tematizado. Se cambió a
    `hover:bg-primary/90` (deriva del propio primario, como ya hacía `destructive`) en el botón
    y en el hero de escaneo, y se **eliminó el token muerto** `--primary-dark` de `globals.css`
    y `tailwind.config.ts` para que no vuelva a usarse como una trampa "parece temático pero es
    fijo". Verificado: el hover ahora es magenta bajo el tema magenta.
- **Bug corregido (afecta `db:reset`):** el `TEARDOWN` de `scripts/setup-db.mjs` no borraba las
  tablas de la era carpas (`carpas`, `carpa_referencias`, `operarios`). Como `carpas` sobrevive
  al `cascade` (nadie la borra; el cascade solo se lleva restricciones, no las tablas que la
  referencian), al recrear el esquema `01-schema.sql` chocaba con `relation "carpas" already
  exists` y dejaba la base a medio montar. Se añadieron al teardown; `db:reset` vuelve a ser
  reproducible. **Sin esto, reconstruir la base fallaba.**
- **Repaso final (checklist `docs/diseno/`):** **sin desplazamiento horizontal en móvil**
  (390px) en 9 pantallas de los cuatro espacios (tablas densas scrollean dentro de su
  contenedor); **foco visible** confirmado; `prefers-reduced-motion` global; **0 errores de
  consola** en todos los recorridos.
- **Video del colaborador 52318904** regrabado (login → 3 catálogos → confirmar → comprobante,
  cerrando en la celebración con los **3 códigos**), a pantalla completa vertical
  (`scratchpad/video/colaborador-52318904.mp4`, ~58 s). Tras grabar, el estrella se restauró a
  **pendiente** con `db:reset`+`db:demo`. _(Nota menor: el video de dev lleva el pequeño
  indicador de Next en una esquina; desaparece en un build de producción.)_

### 8.9 · Réplica del diseño aprobado del cliente (login + beneficiarios) + catálogo real — 🔧 (2026-09-04)

El cliente entregó su propuesta (`docs/diseno/cliente/PROPUESTA…pdf`) y se **replica lo
más fiel posible**, sin proponer alternativas (las mejoras se discuten con el sistema
andando).

- **Login del colaborador** (`/acceso`): composición partida, panel azul del Acueducto con
  su logo en blanco + "Portal de bienestar" + foto con "Nos alegra tenerte aquí." + nota de
  aliado; a la derecha "Ingresa a tu portal", tarjeta azul con los campos y botón turquesa
  "Ingresar", logo de Kidotoy. La foto es swappable en `public/bienvenida/familia.jpg`
  (marcador del mismo tamaño hasta que llegue). Rótulos "Número de cédula / Código SAP"
  (única desviación del texto, necesaria). En móvil el panel azul pasa a banda superior.
- **Mis beneficiarios** (`/acceso/inicio`): encabezado Acueducto + píldora "Regalos en
  alianza con Kidotoy"; "Hola, {nombre}"; tarjetas grandes de color con silueta por género y
  píldora de estado (roja "Falta elegir" / ámbar "Regalo confirmado"). Color por hijo
  DETERMINISTA (hash del id) entre los 4 de Kidotoy. Escritorio: rejilla 2 columnas (2+1,
  2×2, alturas iguales); móvil: 1 columna.
- **Contraste (regla del cliente: oscurecer el fondo, nunca el texto):** los 4 colores de
  tarjeta se usan en variantes PROFUNDAS como tokens (`--kido-*-deep`) para que el texto
  blanco pase AA (turquesa 5.1, morado 5.8, rojo 5.3, ámbar 5.7); el amarillo queda como
  ámbar profundo (bronce). `axe` en beneficiarios: **limpio**.
- **axe verificado** (390 y 1440). Único hallazgo de contraste **deliberado**: ver la nota
  del botón/píldoras abajo.

> **DECISIÓN MARCADA — botón turquesa y píldoras a la espera de proponer AA en bloque.**
> El botón "Ingresar" es turquesa BRILLANTE como el mockup (blanco sobre turquesa = 2.47:1,
> bajo AA); se dejó tal cual por decisión de Sebastián (es lo primero que Kidotoy compararía
> con su diseño; no abrir esa conversación por un color). Igual las píldoras de estado con
> los colores del mockup. Todo está tokenizado: cambiar `bg-kido-turquesa` → `-deep` lo
> lleva a AA en una línea. **Se propone a Kidotoy en bloque cuando se muestre el sistema
> andando**, no antes.

- **Catálogo real (MUESTRA):** se cargaron las **24 referencias** del Excel del cliente
  (`Plantilla_2_Catalogo_de_juguetes.xlsx`), en **4 grupos de 6**: `2-Niña`, `4-Niño`,
  `6-Niña`, `10-Niño`. El seed se **re-alineó** a esos 4 grupos: se conservó el género de
  cada beneficiario (va con el nombre) y solo se cambió la edad a la disponible de su género.
  El **caso estrella 52318904 se conserva** con 3 hijos de edades distintas bajo un mismo
  login —Jerónimo (4·Niño), Valentina (6·Niña), Andrés (10·Niño)— para seguir mostrando
  **tres catálogos distintos**. El resto quedó repartido entre los 4 grupos (4-Niño=9,
  6-Niña=11, 10-Niño=9, 2-Niña=11) y hay **1 referencia agotada** (2-Niña, Cancha Elefante).
  Operarios re-mapeados a carpas 4/6/10 (las que tienen referencias).
- **Imágenes del catálogo:** las fichas traen marco de color + logo Kidotoy + texto + a
  veces la miniatura de la caja. Un script (PIL + scipy) recorta cada una al **producto
  central sobre blanco** (componente más grande; descarta marco/logo/texto/miniatura) y lo
  centra en un lienzo cuadrado. Algunas fichas fotografían el producto DENTRO de su caja
  (p. ej. el carro), y ahí el recorte muestra la caja (es lo más central que hay). Falta
  aplicar a las 24 + el script de asignación `código_referencia → imagen` (a la espera del
  visto bueno de las muestras).

> **PENDIENTE PARA KIDOTOY — catálogo completo (no es el del piloto).** Las 24 referencias
> en 4 grupos son una **MUESTRA**. Producción son **28 grupos** (14 edades 0–13 × 2 géneros)
> con 6 opciones cada uno = **168 referencias**. Sin ellas, un niño de un grupo sin surtir
> entra a un catálogo vacío. Por eso el panel de Kidotoy ahora **muestra los grupos sin
> referencias**: la rejilla de cobertura pinta los 28 grupos (los vacíos como "Sin
> referencias") y el Resumen avisa "24 de 28 grupos sin referencias asignadas". Un grupo sin
> referencias que además tenga beneficiarios esperando sale como **crítico** (no pueden
> elegir). Sebastián le pide a Kidotoy el catálogo completo.

---

### 8.10 · Corrección de fidelidad al mockup + cambios estructurales ✅ (2026-09-05)

Revisión del cliente sobre 8.9: la corrección de contraste había **cambiado los colores de
marca** (turquesa → mostaza, morado → café) y eso destruía la fidelidad, que era el
objetivo. Se revierte y se resuelve la legibilidad por peso de texto, no por color.

**Colores — se vuelve a los hexes exactos del mockup.** Se eliminan los tokens
`--kido-*-deep`. Las tarjetas usan `--kido-turquesa` (#10B7CD) y `--kido-morado` (#8974B3)
tal cual, y el color se asigna **por orden de la lista**, no por hash del id, para que el
primer hijo salga turquesa y el segundo morado como en la propuesta. La línea pequeña
"{edad} años · {género}" sube a `font-medium` + `text-shadow` mínima.

**Tercer color: azul marino, no rojo ni amarillo.** El cliente pidió "los otros dos de
Kidotoy". No se pudo: sobre una tarjeta ROJA la píldora roja de "Falta elegir" desaparece
(misma tinta sobre la misma tinta), y sobre AMARILLO el nombre en blanco queda en 2.0:1,
por debajo incluso del 3:1 de texto grande que el propio cliente cita. Se usa
`--kido-marino` (#101460), el quinto color del manual, que deja legibles las dos píldoras.
**Queda anotado para que el cliente decida.**

**Tokens nuevos, todos muestreados píxel a píxel del PDF de la propuesta** (`sharp`):

| Token | Valor | Dónde |
|---|---|---|
| `--acueducto-azul` | `#135EC3` | panel del login (antes `#1965C8`, más claro) |
| `--acueducto-azul-vivo` | `#0167D5` | titulares y tarjeta de credenciales |
| `--acueducto-lienzo` | `#F5FBFB` | fondo de las dos pantallas (blanco azulado, no gris) |
| `--acueducto-campo` | `#80C8FF` | borde claro de los campos sobre azul |
| `--acueducto-pildora` | `#D4E7F5` | píldora "Regalos en alianza con" |
| `--gris-decorativo` | `#E6ECEC` | forma geométrica de fondo |
| `--kido-*-claro` | 4 tintes | silueta sobre cada tarjeta |

**Login (`/`)**
- Foto con **forma orgánica**: esquinas muy redondeadas y un mordisco cóncavo arriba a la
  izquierda donde se acomodan el logo y "Portal de bienestar". Va con `clipPath` en
  unidades de caja (`objectBoundingBox`), no con `border-radius`: ningún radio hace un
  cóncavo. Detrás, la misma forma en turquesa Kidotoy corrida abajo y a la derecha.
- El **titular va sobre la foto**, en azul, sobre banda blanca al 55%.
- El **borde derecho del panel azul es curvo**: el panel claro monta con
  `md:rounded-l-[2.5rem]`. Para que la curva se vea, el fondo del `main` es el AZUL; con
  fondo claro las esquinas recortaban claro sobre claro y no se notaba nada (ese era el bug).
- Campos **sin caja blanca**: transparentes con borde claro sobre el azul de la tarjeta, y
  el autocompletado de Chrome neutralizado para que no los pinte de amarillo.
- **Móvil**: el mordisco mide el 31% del ancho de la foto; a 390 px son ~105 px y "Portal
  de bienestar" no cabe. Allí la marca sube al flujo y la foto usa radios asimétricos.

**Logo del Acueducto en blanco: SVG, no filtro CSS.** `filter: brightness(0) invert(1)`
sobre un PNG de 500×124 lo dejaba lavado, y además el mockup usa el lockup APILADO (rana
sobre la palabra) sin la bajada. `scripts/trazar-logo.mjs` vectoriza el PNG oficial
(marching squares + RDP + Catmull-Rom), separa por color —la rana y la palabra son cian, la
bajada es negra— y emite `acueducto-marca.svg` y `acueducto-marca-apilada.svg` con
`currentColor`. Se pinta por `mask-image`, sin filtros. **Al llegar el vectorial oficial se
reemplaza el archivo y ya.**

**Foto de bienvenida**: `public/bienvenida/familia.jpg`, de Pexels (elegida por Sebastián),
recortada a la proporción 1.05 de la propuesta. Crédito y recorte en
`public/bienvenida/CREDITO.txt`.

**Beneficiarios (`/inicio`)**
- Siluetas **definitivas del cliente** (`public/siluetas/silueta-ni*.svg`). Vienen con
  `fill="currentColor"`, así que se **incrustan** en el HTML (no `<img>`, no filtro) y la
  tarjeta las tiñe con `text-kido-*-claro`. Se les quita el manifiesto C2PA al incrustar
  (~8 KB de base64 por archivo que se repetirían en cada tarjeta); el archivo en disco queda
  intacto. `scripts/ajustar-siluetas.mjs` ciñe el `viewBox` al dibujo para poder anclarlas
  a la izquierda, altas y cortadas por abajo sin pelear con los márgenes del lienzo.
- La silueta se recorta en el **bloque superior** de la tarjeta, así que nunca invade la
  miniatura del juguete, que va debajo del divisor y alineada a la izquierda.
- Encabezado: "Portal de bienestar" **debajo** del logo y línea divisoria bajo el encabezado.
- Saludo "Hola, {primer nombre} {primer apellido}", como el mockup.

**Cambios estructurales**
- **Fuera la franja amarilla** de "versión de demostración" (componente eliminado; la
  columna `empresas.banner_demo` sigue en BD, sin uso).
- **El espacio del colaborador se mudó a la RAÍZ**: `/` es el login, `/inicio` y
  `/beneficiario/…` cuelgan de ahí (grupo de rutas `app/(colaborador)/`). Se eliminó el
  índice de espacios que vivía en `/`. `/kidotoy`, `/empresa`, `/entrega` y `/dev` no se
  tocan. Las rutas viejas redirigen (308 permanente) desde `next.config.mjs`.
- `zonaDeRuta()` evalúa al colaborador **de último y contra una lista explícita**
  (`RUTAS_COLABORADOR`): resuelto por prefijo, "/" se tragaría los otros cuatro espacios.

**Verificado en navegador real** (Playwright, 1440×900 y 390×844): login → beneficiarios →
catálogo (6 productos) → comprobante → volver, sin errores de consola. Rutas viejas
redirigiendo y `/inicio` sin sesión devolviendo al login.

### 8.11 · Transición de bienvenida (login → beneficiarios) ✅ (2026-09-05)

Adaptación de la transición de Osmo: un trazo turquesa se dibuja y engorda hasta tapar la
pantalla, se navega debajo, y al llegar sigue de largo y adelgaza mientras el saludo entra
desde abajo. Referencia y decisiones de adaptación en `docs/diseno/transicion-osmo.md`.

**Solo en ese paso.** No va en catálogo, confirmación, comprobante, panel de Kidotoy,
portal del Acueducto ni módulo de entrega: ahí la gente trabaja y un segundo entre
pantallas se vuelve insoportable a la tercera vez. En la carpa de entrega serían cientos
de operaciones en una jornada.

**Qué se tomó del ejemplo y qué no:** GSAP + DrawSVGPlugin + CustomEase sí (paquete público
de npm; desde 3.13 los plugins son gratuitos, uso comercial incluido — **no hay registro
privado ni token**). Barba.js no: es para sitios multipágina y el App Router ya hace esa
navegación. Lenis tampoco: es scroll suave y este producto es de formularios.

**Cómo quedó armado**
- `ProveedorTransicion` en `app/(colaborador)/layout.tsx`, que persiste entre `/` y
  `/inicio`, así que la capa sobrevive a la navegación.
- `accederColaborador()` ya NO redirige desde el servidor: devuelve `{ ok: true }` y el
  cliente dispara la salida; al terminar de cubrir, `router.push()`.
- `FinTransicion` va **dentro** de la página `/inicio`, no en un `template.tsx`: el template
  se renderiza por fuera del límite de Suspense de `loading.tsx` y habría descubierto sobre
  el esqueleto.
- `router.prefetch()` al empezar la salida, no antes: sin sesión, `/inicio` responde con el
  redirect del middleware.

**GSAP se carga diferido.** Importado de forma estática subía el primer JS del login de
115 a 148 kB (+33), y el login es la pantalla más sensible: la mayoría entra desde el
celular. Se pide al montar, en segundo plano; para cuando alguien termina de teclear cédula
y código SAP ya está. Si no llegó, se navega sin animación. Con la carga diferida el login
volvió a 116 kB.

**Medido en navegador real, sobre build de producción** (screencast por CDP, fotograma a
fotograma):

| | Resultado |
|---|---|
| Duración total de la capa | **985 ms** (tope pedido: 1.2 s) |
| Reparto | 0.40 s cubrir · ~0.10 s navegar · 0.48 s descubrir |
| `prefers-reduced-motion: reduce` | la capa **nunca** se hace visible; ni siquiera se carga GSAP; navegación directa |
| Título tras terminar | `opacity=1 visibility=visible transform=none`, sin estilos en línea |
| Errores de consola | ninguno |

**Dos cosas que solo aparecieron al grabarlo y mirarlo:**

1. **El temporizador de seguridad estaba mal calibrado.** Con 250 ms (elegidos para que el
   peor caso cupiera en 1.2 s) la capa se destapaba **antes de que la navegación aterrizara
   y volvía a mostrar el login**. Se lee como "no pasó nada", que es peor que un segundo de
   más. Ahora el temporizador es una RED DE SEGURIDAD de 2.5 s, no parte del presupuesto:
   lo normal es que el destino avise a los ~100 ms gracias al prefetch. **Desviación
   consciente del tope de 1.2 s**: en el camino lento se prefiere sostener la capa a
   destapar sobre la pantalla equivocada.
2. **El toast "Sesión iniciada" chocaba con la transición.** Saltaba encima de la pantalla
   ya tapada y repetía la bienvenida que la animación ya da. El destino del colaborador
   dejó de llevar `?bienvenido=1`. Los otros espacios lo conservan: allí no hay transición.

Ojo con desarrollo: **el prefetch de Next está desactivado en `next dev`**, así que allí la
capa se sostiene ~1.6 s esperando a que compile y responda `/inicio`. La medición de arriba
es sobre `next build` + `next start`.

### 8.12 · Fotos reales del catálogo en Supabase Storage ✅ (2026-09-05)

Las 23 fichas de producto de Kidotoy pasaron a ser las fotos del catálogo. Todo en un
script reproducible: `npm run catalogo:imagenes`.

**Recorte.** Las fichas son 1080×1080 con marco de color al borde, logo Kidotoy arriba a la
derecha, miniatura de la caja arriba a la izquierda y pie con SKU, nombre y medidas. El
recorte NO usa rectángulos fijos para el logo ni para el pie —el logo se mueve entre fichas
y varios productos se le acercan por debajo—: se etiquetan **componentes conexos** y se
descartan los que son plantilla. Tres cosas que costaron y quedan anotadas:

1. **Descartar un componente no basta: hay que BORRAR sus píxeles.** Descartarlo solo
   encoge la caja, y si el producto es alto o ancho su caja igual se come el logo o el pie,
   que siguen ahí dentro. Ahora se pintan de blanco antes de recortar.
2. **Recortar un CUADRADO del original vuelve a meter la plantilla.** En las fichas anchas
   el cuadrado se estira hasta el logo y el pie. Se recorta la caja exacta del producto y se
   centra sobre un lienzo blanco de 800×800.
3. **El umbral de "tinta" subió de 12 a 26.** Algunas fichas llevan un device de marca gris
   clarísimo detrás; a 12 ese device tocaba el texto del pie, los dos formaban UN componente
   que ya no era pálido ni cabía bajo el corte del pie, y sobrevivía estirando la caja.

**Decisión sobre la miniatura de la caja: se conserva.** Aparece en 13 de 23 fichas y en las
otras 10 no existe en el original. No es removible automáticamente sin destrozar varias: en
Carro Drift, Carruaje, Silla mecedora y Tocador la caja es tan protagonista como el juguete,
y en Tío Rico la caja está a la derecha, no a la izquierda. La regla uniforme es "se borra
la plantilla (marco, logo, pie), que sí está en posición fija, y se conserva lo que el
fotógrafo puso en la zona del producto". Consultado y aprobado.

**Salida:** 800×800, fondo blanco, WebP + JPG de respaldo. Máximo **78 KB** en WebP,
promedio 41 KB (objetivo: 120 KB).

**Storage.** Bucket `catalogo` creado desde `supabase/05-storage.sql` (reejecutable):
`public = true`, límite de 2 MB por objeto, solo webp/jpeg/png. Política de **lectura**
anónima explícita acotada a ese bucket; **sin** políticas de insert/update/delete, así que
RLS niega: el único que escribe es el rol de servicio, que vive solo en el script local.
Ruta `catalogo/{codigo_referencia}.webp`, `cache-control: 31536000`.

> **`REFHE0816/HE0817` lleva una barra en el código de referencia**, así que en Storage
> queda como carpeta `REFHE0816/` con el objeto `HE0817.webp`. La URL pública va con `%2F`
> y resuelve bien (verificado, 200 image/webp). Si algún día aparece un código con otro
> carácter raro, revisar este caso antes de asumir que funciona.

**Vinculación por SKU, nunca por nombre.** Los SKU no venían en el nombre del archivo, solo
impresos en la imagen: se leyeron uno a uno a resolución nativa y quedaron en
`scripts/catalogo-mapa-sku.json`. Las fichas que lleguen después NO necesitan esa tabla si
el archivo trae el SKU en el nombre (`KDT008183.png`): el script lo saca de ahí. Si una
imagen no empareja, o una referencia queda sin foto, se listan; no se adivina por parecido.
Un juguete unisex ocuparía varias filas con el mismo `sku` y todas quedarían apuntando a la
misma foto (hoy no hay ninguno: los 24 SKU del catálogo son distintos).

**Dos pasos a propósito.** Sin `--aplicar` el script recorta, dibuja la hoja de contacto e
imprime el mapa, y no toca ni Storage ni la base. Con `--aplicar` sube y vincula. Idempotente:
bucket con `on conflict`, políticas con `drop if exists`, subida con `upsert` sobre la misma
ruta y URL determinista a partir del código de referencia.

**Que no se pierdan al reconstruir la base.** `--aplicar` genera `supabase/06-imagenes.sql`
con los `update ... set imagen_url`, y `db:setup` lo aplica después del seed (que reinserta
el catálogo con `imagen_url` en null). Si el archivo no existe todavía, se salta.

**Verificado**
- **23 de 24 referencias con foto.** Falta `KDT008183` / `REF7007-2A` — "Cancha Elefante
  3 en 1 con Luces y Sonidos" (2 años): no llegó su ficha. Cuando la manden, se suelta en
  `docs/diseno/fichas/` y se corre el script. **Cero imágenes huérfanas.**
- Las 23 URLs cargan **sin sesión** (fetch directo, sin cabeceras): 200 `image/webp`,
  `cache-control: public, max-age=31536000`.
- Escritura anónima bloqueada: `upload` da "new row violates row-level security policy".
  `remove()` **no da error pero tampoco borra** —RLS filtra las filas y devuelve `[]`—;
  comprobado que el objeto sigue en el bucket y sigue descargándose. Ojo con esa forma de
  la API: la ausencia de error no prueba permiso.
- **Respaldo `onError` funcionando**: con Storage caído (peticiones abortadas en el
  navegador) el catálogo muestra los 6 previews de marca y no queda ningún `<img>` roto.

**`object-contain`, nunca `object-cover`.** `ImagenProducto` forzaba `object-cover` y los
juguetes se recortaban por los bordes: se perdía el manubrio de un scooter, la caja de un
juego, media casa de muñecas. El colaborador elige un regalo a partir de esa foto, así que
tiene que verla entera. Cambiado en el componente compartido (catálogo, confirmación,
tarjeta del beneficiario y módulo de entrega) y en la miniatura del comprobante, que tenía
su propio `<img>`. El hueco de la tarjeta del catálogo era `lg:aspect-[4/3]` y las fotos son
cuadradas: ahora es cuadrado en todos los tamaños, así entra exacta y sin bandas. El fondo
pasó de `bg-secondary` a `bg-white` para que, donde el contenedor no sea cuadrado, el
letterbox se funda con el blanco de la propia foto. La foto de bienvenida del login sigue en
`object-cover` a propósito: esa sí rellena una forma.

> Al verificar con capturas, ojo: `fullPage` de Playwright NO dispara el `loading="lazy"` de
> las imágenes de abajo, y salen en blanco aunque en el navegador se vean bien. Verificar en
> viewport real o forzando el scroll.

**Peso.** 23 objetos = **951 KB**. Proyección a producción con 168 referencias: **~6.8 MB**
de los 1024 MB del plan gratuito. Sobra de largo; el almacenamiento no es el motivo por el
que producción necesita plan Pro (ese sigue siendo la concurrencia de Realtime).

## Pendientes de producción (no hacer en el piloto)

- **Plan Pro de Supabase.** La concurrencia de Realtime con ~500 colaboradores el mismo
  día no cabe en el plan gratuito (200 conexiones). También habilita respaldos.
- **Resend en producción.** Dominio verificado propio de Kidotoy y plan con volumen
  (gratuito ≈ 100/día, 3.000/mes; el día pico se pasa). En el piloto se usó `vaisy.app`.
- **Correos reales de colaboradores.** El correo de confirmación solo se envía a
  colaboradores con `correo` real; el seed usa `@demo.local` (no entregable).
- **Verificación humana de los correos:** abrir confirmación y resumen en Gmail/Outlook,
  revisar spam, imprimir la confirmación en B/N.
- **Recorrido físico en celular** de `/acceso` y `/entrega` (aquí solo se hizo emulación).
- **Fuente Geist** en el panel de temas: descartada (requiere el paquete `geist`, no está
  en next/font/google). Reactivar es una decisión de dependencia.
- **Modo sin conexión** del módulo de entrega (fuera del alcance del piloto; el modelo de
  datos ya lo contempla con `entregas.sincronizado_en`).
- **Cron externos** conectados: keepalive (24 h) y resumen diario. Ver `DESPLIEGUE.md`.
- **Datos reales de menores** solo con contrato firmado y política de tratamiento.
- **Nombre del operario en la entrega.** Hoy `registrar_entrega` guarda y muestra el
  **correo** de la cuenta del operario (p. ej. en la pantalla roja "ya fue entregado"). En
  producción conviene capturar y mostrar el **nombre** del operario, más legible para quien
  audita una entrega. El identificador ya queda registrado; es solo presentación.

### Notas para fases siguientes

- La validación de **ventana de selección** (`ventana_inicio`/`ventana_fin`) va en Fase 2,
  incluido el comportamiento fuera de ventana (parte de lo que se quiere poder mostrar).
- La lista curada de fuentes incluye **Geist**, que no está en `next/font/google` (requiere
  el paquete `geist`). Se resuelve al construir el panel `/dev/tema` en Fase 5.
- `lib/supabase/admin.ts` (service role, `server-only`) queda listo para las operaciones
  administrativas de las fases 3 y 6.

### Huecos honestos (pendientes por dato que aún no existe)

Regla del proyecto: si una pantalla necesita un dato que todavía no tenemos (un contacto,
una URL, un texto legal), **no se simula ni se deja con apariencia de funcional**. Se deja
como **texto plano** (sin color de enlace ni subrayado, sin `href`) y se anota aquí. Un
hueco honesto es mejor que algo que parece andar y no anda.

- **Contacto de Recursos Humanos** (correo o extensión). Aparece como texto plano en el
  login del colaborador (`components/auth/login-colaborador.tsx`) y en el estado vacío de
  "Mis beneficiarios". Cuando llegue el dato, cablearlo como `mailto:`/`tel:`. _(8.2)_
- **Horario del evento** (`empresas.evento_hora`). La columna existe pero está **NULA** a
  propósito: el evento es real (12-dic, Parque Jaime Duque) pero la hora aún no la da
  Kidotoy. El comprobante muestra el horario solo si existe; si es null, **ausencia limpia**
  (nada de "por confirmar"). Un horario inventado es el que nadie corrige y termina impreso.
  Sebastián lo va a pedir a Kidotoy. Cargar: `update empresas set evento_hora = '…';`. _(8.4)_

- **Fotos reales de producto** (`productos.imagen_url`). Hoy null → preview de marca. Cuando
  Kidotoy mande ~12 fotos, armar un script de asignación `codigo_referencia → URL` (pedido
  por Sebastián, para que sea reproducible). Requisitos: URL pública HTTPS, cuadradas, fondo
  claro, optimizadas. _(8.3)_
