# Despliegue del PILOTO en Cloudflare Workers

Para que Kidotoy y el Acueducto prueben la plataforma durante los ~20 días del piloto.
**Gratis, en `workers.dev`, sin tocar nada del cliente y desechable.**

La plataforma de **producción** es otra: VPS en la cuenta de Kidotoy, con subdominios por
empresa. Ver **`docs/DESPLIEGUE-VPS.md`**.

**Fecha:** 5 de septiembre de 2026. Si pasan meses, revisa el punto 0: esta historia ha
cambiado varias veces.

---

## 0. Por qué esta vía y no otra

Hay **tres** caminos vivos para Next.js en Cloudflare:

| Vía | Estado real | Decisión |
|---|---|---|
| `@cloudflare/next-on-pages` (adaptador de **Pages**) | **Deprecado.** Además exigía runtime *edge* en todas las rutas | Descartado |
| `vinext` | Lo que Cloudflare **recomienda por defecto** hoy, pero es un plugin de Vite que **reimplementa la superficie de API de Next.js**, y está **en beta** | Descartado |
| `@opennextjs/cloudflare` (OpenNext, sobre **Workers**) | Mantenido y soportado. Corre el runtime **Node de Next.js** sobre Workers | **Este** |

`vinext` se descartó **aunque sea la recomendación oficial**: reimplementar la API de Next.js
significa que las diferencias aparecen en los bordes, y esto lo va a abrir un tercero sin
acompañamiento para ganar una licitación.

**Y ojo: es Workers, no Pages.** Es cierto que Pages no ejecuta tareas programadas, pero deja
de importar: **Workers tiene Cron Triggers nativos** (punto 5).

### Por qué no Vercel

Es la opción gratuita obvia y funcionaría sin tocar una línea. Pero sus términos dicen que
**Hobby está restringido a uso personal no comercial**, y definen uso comercial como
cualquier despliegue con fin de lucro de cualquiera involucrado en su producción,
**incluido un consultor pagado por escribir el código**. Cobras por construirlo y Kidotoy lo
usa para ganar una licitación: es uso comercial sin ambigüedad, y Vercel pausa cuentas por
eso. Sería justo a mitad de la licitación.

### El tamaño ya está medido — cabe en el plan gratuito

| | |
|---|---|
| Bundle del Worker | **8584 KiB** sin comprimir · **1744 KiB comprimido** |
| Tope del plan gratuito | 3072 KiB comprimido |
| **Resultado** | **Cabe, con 43 % de margen** |

Medido con `npm run cf:size`. **No hace falta plan de pago.**

Si en algún momento crece (más dependencias, más pantallas), vuelve a medir:

```bash
npm run cf:size
```

---

## 1. Estado del repositorio — ya preparado

Los cambios de código **ya están aplicados y el build pasa**. Esto es el registro de qué se
tocó y por qué.

### 1.1 Siluetas: del disco a un módulo — **NO es desechable**

`components/colaborador/silueta.tsx` leía los SVG con `readFileSync` sobre `public/`.

Workers **sí** tiene `node:fs`, pero sobre un **sistema de archivos virtual**; `public/` se
publica como *assets estáticos* y **no entra al bundle del Worker**. Esa lectura fallaba en
producción — y encima en "Mis beneficiarios", la pantalla más importante — **sin dar ningún
error en el build**.

Ahora los SVG viven en `components/colaborador/siluetas-datos.ts`, generado por
`scripts/ajustar-siluetas.mjs`. Se siguen incrustando en el HTML, `currentColor` sigue
funcionando y la tarjeta los sigue tiñendo igual.

> **Este cambio se queda para siempre**, también en el VPS. No es daño colateral de
> Cloudflare: es quitarle al código una dependencia del sistema de archivos del hosting.
> Sigue funcionando el flujo de siempre: sueltas SVG nuevos en `public/siluetas/`, corres
> `node scripts/ajustar-siluetas.mjs` y el módulo se regenera solo.

### 1.2 Fuera el ISR — **NO es desechable**

`app/layout.tsx` tenía `export const revalidate = 300`. Obligaba a montar una caché
incremental externa (un bucket R2). Se quitó.

A esta escala no aporta nada, y trae un efecto secundario bueno: **los cambios de tema y
marca desde `/dev/tema` se ven al instante** en vez de esperar 5 minutos. En el VPS tampoco
estorba.

### 1.3 Los TRES archivos desechables

Estos **se borran el día de la migración al VPS** y no dejan rastro:

| Archivo | Qué es |
|---|---|
| **`open-next.config.ts`** | Configuración del adaptador |
| **`wrangler.jsonc`** | Configuración del Worker: nombre, flags, assets, cron |
| **`custom-worker.ts`** | Entrypoint propio, para poder añadir las tareas programadas |

Al migrar, además:

```bash
npm uninstall @opennextjs/cloudflare wrangler
```

y quitar de `package.json` los scripts `cf:build`, `cf:preview`, `cf:deploy`, `cf:size`;
de `.gitignore` las líneas `.open-next/` y `.dev.vars`; y de `tsconfig.json` las entradas
`custom-worker.ts` y `open-next.config.ts` del `exclude`.

**Nada más.** El resto del código es portable tal cual.

### 1.4 Qué se revisó y funciona

| Pieza | Estado |
|---|---|
| Acciones de servidor (login y todas las confirmaciones) | ✅ |
| Middleware de protección por rol | ✅ Es middleware *edge*, no Node Middleware (lo único que OpenNext no soporta) |
| Clientes de Supabase, incluido el de rol de servicio | ✅ Van sobre `fetch` |
| Envío por Resend | ✅ `fetch` plano, sin SDK |
| `/api/keepalive` y `/api/resumen-diario` | ✅ |
| Realtime por WebSocket | ✅ Ocurre en el navegador, nunca pasa por el Worker |
| Rutas dinámicas y SSR | ✅ |
| QR en servidor (`qrcode.toString` type svg) | ⚠️ Devuelve un string, sin canvas ni módulo nativo. **Confirmar en el primer preview** |

**La atomicidad del inventario y el bloqueo por intentos no se tocan.** Viven en funciones de
Postgres y se ejecutan en la misma base pase lo que pase con el hosting.

---

## 2. Crear el proyecto en Cloudflare

Repositorio `Naanita/Kidotoy-masive`, rama `main`.

1. Panel de Cloudflare → **Workers & Pages** → **Create** → **Workers** → **Import a
   repository**.
2. Autoriza GitHub y elige `Naanita/Kidotoy-masive`.
3. Configuración de build:

| Campo | Valor |
|---|---|
| **Project name** | `kidotoy-piloto` |
| **Production branch** | `main` |
| **Build command** | `npx opennextjs-cloudflare build` |
| **Deploy command** | `npx wrangler deploy` |
| **Build output directory** | *(vacío — lo resuelve `wrangler.jsonc`)* |
| **Root directory** | `/` |

> **No confundas con Pages.** Si el asistente ofrece "Pages", es la vía deprecada. Workers.

4. **Antes de lanzar el primer build, carga las variables del punto 3.**

Alternativa sin panel, desde tu máquina:

```bash
npx wrangler login
npm run cf:deploy
```

### Prueba local antes de subir nada

```bash
npm run cf:preview
```

Levanta el sitio sobre `workerd`, el runtime real de Cloudflare. **Es el momento de
confirmar el QR del comprobante y que `/inicio` pinta las siluetas.**

---

## 3. Variables de entorno

### La trampa: build vs runtime

Las `NEXT_PUBLIC_*` **se incrustan en el JavaScript durante el build**. Si solo las pones
como variable de runtime, el build las deja vacías y **el sitio sale roto sin un solo error
en el log**.

**Las tres `NEXT_PUBLIC_*` van en las variables de BUILD y también en las de runtime.**

| Variable | Tipo | Dónde | Preview |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Build **y** runtime | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Build **y** runtime | Sí |
| `NEXT_PUBLIC_EMPRESA_SLUG` | Pública (valor: `acueducto`) | Build **y** runtime | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔒 **Secreta** — salta RLS | Runtime, como **Secret** | **No** |
| `RESEND_API_KEY` | 🔒 **Secreta** | Runtime, como **Secret** | **No** |
| `CRON_SECRET` | 🔒 **Secreta** | Runtime, como **Secret** | **No** |
| `RESEND_FROM` | Texto plano | Runtime, como Variable | Opcional |
| `RESUMEN_EMAIL` | Texto plano | Runtime, como Variable | Opcional |

### `SUPABASE_DB_URL` NO se sube

Es la conexión directa a Postgres e **incluye la contraseña de la base**. Solo la usan los
scripts locales. La aplicación nunca la lee. **No la cargues en Cloudflare.**

### Por qué los secretos no van al entorno de vista previa

Los previews se generan por rama y por PR, con URLs públicas y adivinables. Con la clave de
servicio ahí, cualquiera con la URL llegaría a los datos saltándose RLS. En preview, las
pantallas que los necesitan degradan (no sale correo, el resumen responde 401) y eso es
exactamente lo que se quiere.

Para el preview local, crea un `.dev.vars` con los mismos valores. **No se versiona.**

---

## 4. Dominio: ninguno

**Para el piloto no hace falta dominio.** Cloudflare da
`kidotoy-piloto.<tu-subdominio>.workers.dev` con **HTTPS automático**. Cero DNS, cero
certificados, cero espera, cero contacto con la infraestructura del cliente.

**Y eso desbloquea la cámara.** `getUserMedia` solo funciona en contexto seguro: HTTPS o
`localhost`. Por eso en local el escáner de QR solo servía en `localhost` y no desde el
celular. Con `workers.dev` en HTTPS, **el escaneo funciona desde cualquier celular**.

El dominio propio con subdominios por empresa es cosa de producción: `DESPLIEGUE-VPS.md`.

---

## 5. Los dos cron — no es opcional

Sin el keepalive, **Supabase pausa el proyecto tras 7 días sin actividad** y el piloto se
apaga a mitad de los 20 días. Cuando pasa, la aplicación deja de responder por completo
hasta que alguien la reactive a mano.

Al ir sobre Workers esto es nativo: sin cron externo ni servicio de terceros.

El Worker que genera OpenNext solo exporta `fetch`. Por eso existe **`custom-worker.ts`**,
que lo reutiliza y añade el `scheduled`; y por eso `wrangler.jsonc` apunta ahí y no a
`.open-next/worker.js`. Las dos tareas despachan **contra la propia aplicación**, reusando
las rutas que ya existen y están probadas. No se duplica lógica.

Los horarios están en `wrangler.jsonc`. **Cloudflare usa UTC**; Bogotá es UTC−5:

- `0 9 * * *` → 04:00 Bogotá — keepalive
- `30 12 * * *` → 07:30 Bogotá — resumen diario

### Probarlos sin esperar a mañana

```bash
npx wrangler dev
# en otra terminal:
curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=0+9+*+*+*"
curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=30+12+*+*+*"
```

Ya desplegado: Worker → **Settings** → **Trigger Events**, y los logs en **Observability**.

> **Comprueba el keepalive el segundo día.** Es de lo que depende que el piloto siga en pie
> tres semanas, y falla en silencio.

---

## 6. Storage y CORS

**No hay nada que configurar.** Las fotos se cargan con `<img src>` plano, y `<img>` sin
atributo `crossorigin` **no está sujeto a CORS**. Solo importaría si las bajáramos por
`fetch` desde JavaScript, y no lo hacemos.

**Verificación** sobre el sitio en vivo: abre el catálogo de Valentina, DevTools →
**Network**, filtra por `storage`: las 6 imágenes en **200** con `content-type: image/webp`,
y consola sin errores de CORS ni de contenido mixto.

---

## 7. Supabase

**Impacto real: casi ninguno.** Entramos con `signInWithPassword` y cookies; no usamos OAuth,
ni magic link, ni recuperación de contraseña — ninguno de los flujos que dependen de URLs de
redirección.

Aun así, deja la configuración coherente: **Authentication → URL Configuration** → Site URL
`https://kidotoy-piloto.<tu-subdominio>.workers.dev`.

**No toques** las claves (no dependen del dominio), ni RLS, ni la base.

---

## 8. Verificación sobre el sitio en vivo

Todo **contra la URL de `workers.dev`**, no en local.

### Los cinco accesos

- [ ] `/` — colaborador: `52318904` / `SAP-007340`
- [ ] `/kidotoy` — `admin@kidotoy.local` / `Kidotoy#2026`
- [ ] `/empresa` — `rrhh@acueducto.local` / `Acueducto#2026`
- [ ] `/entrega` — `entrega@kidotoy.local` / `Entrega#2026`
- [ ] `/dev` — `dev@kidotoy.local` / `DevKidotoy#2026`

### Recorrido del caso estrella

- [ ] Entrar como `52318904` y ver la **transición de bienvenida**
- [ ] Tres hijos: Jerónimo confirmado, Valentina y Andrés pendientes
- [ ] **Las siluetas se ven** — es el arreglo de 1.1; si salen vacías, algo falló
- [ ] Catálogo de Valentina: 6 opciones con foto real
- [ ] Catálogo de Andrés: **6 opciones distintas** (demuestra el filtro por edad)
- [ ] Comprobante de Jerónimo con el **QR pintado** y el código `D9329C4CD4`
- [ ] Las rutas viejas redirigen: `/acceso` → `/`

### Realtime — dos pestañas y la última unidad

`REFBX-688` ("Scooter infantil avión oso", 4 años) tiene **1 unidad**.

- [ ] Dos pestañas en el catálogo de un niño de 4 años
- [ ] Confirmar en A → **B se actualiza sola** y queda agotada
- [ ] Si B confirma igual, mensaje **en español claro**, no un volcado

> Si B no se actualiza, revisa `supabase.realtime.setAuth(token)` en el catálogo. Sin eso,
> RLS bloquea los eventos **sin ningún error visible**.

### Escaneo de QR desde un celular real

- [ ] Abrir la URL `/entrega` **desde el celular**
- [ ] Entrar como operario y pulsar escanear
- [ ] **El navegador pide permiso de cámara**
- [ ] Escanear el QR del comprobante de Jerónimo desde otra pantalla
- [ ] Con el operario de la **Carpa 4** y un código de la **Carpa 2** (`A46A0DFDE6`): sale el
      **aviso de carpa distinta** y **deja entregar igual**

> Si marcas alguna entrega, apúntala: cambia el estado de la demostración.

### Correo, cron y salud

- [ ] Poner un correo real en un colaborador con un solo hijo pendiente, completar su
      selección y **recibir el correo** (los del seed son `@demo.local`, no entregables)
- [ ] `/api/keepalive` responde **200**
- [ ] `/api/resumen-diario` **sin** secreto responde **401**
- [ ] Trigger Events muestra las dos tareas; al día siguiente, ejecutadas

### Los otros tres espacios y la consola

- [ ] **Kidotoy:** resumen (avance 70 %), selecciones, inventario, entregas, carpas,
      operarios, catálogo. Exportar un CSV
- [ ] **Acueducto:** avance y pendientes. **Confirmar que NO puede** liberar ni editar stock
- [ ] **Entrega:** buscar por código y por cédula
- [ ] DevTools abierto en los cinco espacios: **cero errores**, cero contenido mixto

---

## 9. Advertencias

### El banner de demostración no debe volver

Se retiró de la interfaz; la columna `empresas.banner_demo` sigue en `true` pero ya no la lee
nadie.

- [ ] Confirmar que **no aparece** la franja amarilla

Consecuencia a tener presente: hoy **no hay ninguna marca visual** que avise de que los datos
son ficticios.

### NO resiembres la base después de desplegar

La base es la misma de desarrollo. **No corras `db:reset` ni `db:demo`.** Los códigos de
entrega se generan al azar en `confirmar_seleccion()`: si resiembras, **todos cambian** y el
material de presentación queda obsoleto. Los vigentes están en `docs/ESTADO-ACTUAL.md`.

### Los secretos, fuera del repositorio

- [ ] `.env.local` en `.gitignore` (línea `.env*.local`)
- [ ] `.dev.vars` en `.gitignore`
- [ ] Ninguna clave en el código: todo sale de `process.env`
- [ ] `SUPABASE_DB_URL` **no** cargada en Cloudflare
- [ ] Las tres claves 🔒 como **Secret**, no como Variable, y **no** en preview

```bash
git ls-files | grep -E "^\.env"     # solo debe salir .env.example
git check-ignore -v .env.local .dev.vars
```

---

## 10. Si algo falla

| Síntoma | Causa probable |
|---|---|
| Compila pero todo sale roto, sin errores | Faltan las `NEXT_PUBLIC_*` en las variables de **build** |
| `/inicio` revienta | El módulo de siluetas (1.1) no se generó: corre `node scripts/ajustar-siluetas.mjs` |
| El comprobante sale sin QR | Reproducir con `npm run cf:preview` para verlo en local |
| El catálogo no se actualiza solo | `realtime.setAuth` — falla en silencio |
| No llega ningún correo | El colaborador no tiene correo real, o falta `RESEND_API_KEY`. El envío es *best-effort*: nunca rompe el flujo |
| El resumen diario responde 401 | Falta `CRON_SECRET` o no coincide |
| El escáner no pide cámara | No estás en HTTPS |
| Deja de responder tras unos días | Supabase pausó el proyecto: el keepalive no corre |
| El upload se rechaza por tamaño | Volver a medir con `npm run cf:size` |
