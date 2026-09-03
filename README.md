# Plataforma de selección de regalos · Kidotoy

Paquete de arranque. Léelo, luego lee `CLAUDE.md`.

## Contenido

```
CLAUDE.md                          Contexto permanente. Lo primero que lee Claude Code.
docs/01-especificacion-funcional.md Qué hace cada pantalla, con los flujos completos.
docs/02-sistema-de-diseno.md        Tokens, panel de temas y reglas por espacio.
supabase/01-schema.sql              Tablas, índices y vistas.
supabase/02-rls.sql                 Row Level Security. El aislamiento vive aquí.
supabase/03-funciones.sql           confirmar_seleccion y demás lógica de negocio.
supabase/04-seed.sql                Datos ficticios del piloto.
seed/*.csv                          Los mismos datos en CSV, para revisar o reimportar.
```

## Puesta en marcha

1. Crear proyecto en Supabase (plan gratuito sirve para el piloto).
2. Ejecutar en el editor SQL, en orden: `01-schema`, `02-rls`, `03-funciones`, `04-seed`.
3. Crear los usuarios de autenticación. Para cada colaborador del seed:
   correo `{cedula}@acueducto.interno`, contraseña = su `codigo_sap`, y en `app_metadata`
   `{"empresa_id": "...", "rol": "colaborador"}`. Luego actualizar
   `colaboradores.auth_user_id`. Conviene hacerlo con un script usando la clave de servicio.
4. Crear a mano los usuarios de `admin_kidotoy`, `empresa_cliente`, `operario_entrega` y
   `admin_dev`, con el mismo `empresa_id` en `app_metadata`.
5. `npx create-next-app` con TypeScript y Tailwind, luego `npx shadcn@latest init`.
6. Variables de entorno: URL y claves de Supabase, `RESEND_API_KEY`, `CRON_SECRET`.

## Datos del piloto

Todos ficticios. Catálogo de 36 referencias cubriendo las edades 3, 7 y 12 en ambos
géneros. Varias referencias son unisex y aparecen en dos filas con distinto
`codigo_referencia` y el mismo `sku`, que es exactamente como se manejará en producción.

**Caso de demostración:** cédula `52318904`, código SAP `SAP-007340`. Tiene tres hijos de
3, 7 y 12 años, así que muestra tres catálogos distintos bajo un mismo inicio de sesión.
Es el mejor recorrido para enseñarle al Acueducto.

## Advertencia sobre el plan gratuito

El proyecto de Supabase se pausa tras 7 días sin actividad. El piloto va a estar 20 días
esperando a que el Acueducto lo abra. Montar el `/api/keepalive` con un cron externo antes
de entregar, o la demostración se cae justo cuando importa.

---

## Aplicación (Next.js) — puesta en marcha local

La app vive en la raíz del repo (Next.js App Router + TypeScript + Tailwind v3 + shadcn/ui).

1. Instalar dependencias: `npm install`
   (hay un `.npmrc` local que apunta al registro público de npm; ver PROGRESO.md).
2. Copiar `.env.example` a `.env.local` y rellenar las claves de Supabase.
3. Ejecutar el SQL en el panel de Supabase, en orden: `01-schema`, `02-rls`,
   `03-funciones`, `04-seed`. Sin esto, el tema usa valores por defecto y
   `/api/keepalive` responde 502.
4. `npm run dev` → http://localhost:3000
5. Comandos útiles: `npm run typecheck`, `npm run build`.

## Keepalive — cómo conectar un cron externo

La ruta `GET /api/keepalive` llama a la función `ping()` por RPC con la anon key y
responde `{ "ok": true, "ping": "<timestamp>" }`. Una llamada a RPC cuenta como
actividad en Supabase, así que evita que el proyecto se pause. **No usa la service
role key**: es una ruta pública, y usar la clave más privilegiada ahí sería un riesgo
innecesario.

Conéctale un cron externo que la invoque **cada 24 horas** (basta con menos de 7 días).
Opciones sin costo:

- **cron-job.org**: crear un job GET a `https://TU-DOMINIO/api/keepalive`, intervalo
  diario. Es la opción más simple y no depende del hosting.
- **GitHub Actions** (si el repo está en GitHub): workflow con
  `schedule: - cron: "0 6 * * *"` y un paso `curl -fsS https://TU-DOMINIO/api/keepalive`.
- **Cron del propio hosting / VPS**: `0 6 * * * curl -fsS https://TU-DOMINIO/api/keepalive`

Verificar a mano: `curl https://TU-DOMINIO/api/keepalive` debe devolver HTTP 200 y
`ok: true`. Mientras la base no tenga la función `ping()`, devolverá 502 (esperado).
