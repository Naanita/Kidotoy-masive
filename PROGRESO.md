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

### Pantallas de los mockups que NO se construyen sin confirmación (regla #6)

Gráficas del panel (incl. "inventario por categoría" — no existe el campo categoría);
campana de notificaciones y feed de actividad reciente; "historial de entregas" del
operario; capacidad por carpa (no existe el campo); paginación de tablas. Pendiente de
decisión de Sebastián.

---

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

### Notas para fases siguientes

- La validación de **ventana de selección** (`ventana_inicio`/`ventana_fin`) va en Fase 2,
  incluido el comportamiento fuera de ventana (parte de lo que se quiere poder mostrar).
- La lista curada de fuentes incluye **Geist**, que no está en `next/font/google` (requiere
  el paquete `geist`). Se resuelve al construir el panel `/dev/tema` en Fase 5.
- `lib/supabase/admin.ts` (service role, `server-only`) queda listo para las operaciones
  administrativas de las fases 3 y 6.
