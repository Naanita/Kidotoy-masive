# Guía corta de despliegue

Plataforma de selección de regalos · Kidotoy. Piloto en infraestructura de Sebastián.

## Antes de entregar al cliente (checklist, en orden)

- [ ] **1. Conectar el cron del keepalive PRIMERO.** `GET /api/keepalive` cada 24 h. El
      proyecto de Supabase se pausa a los 7 días sin actividad y el piloto va a estar ~20
      días esperando a que el Acueducto lo abra: sin esto, la demostración se cae sola.
- [ ] 2. Aplicar la base con `npm run db:reset` y cargar el caso demo con `npm run db:demo`.
- [ ] 3. Verificar `GET /api/keepalive` → responde `200`.
- [ ] 4. Cargar todas las variables de entorno en el hosting (sección 2). Confirmar que la
      app está en **HTTPS** (el escáner QR de `/entrega` necesita cámara).
- [ ] 5. Conectar el cron del resumen diario (`/api/resumen-diario` con `CRON_SECRET`).
- [ ] 6. Probar un login de cada espacio con los usuarios de la sección 5.
- [ ] 7. Recorrer el flujo del colaborador `52318904` de punta a punta en un **celular
      real** (login → elegir → confirmar → comprobante).
- [ ] 8. Enviarse a sí mismo el correo de confirmación y el resumen; abrirlos en Gmail y
      Outlook y revisar que no caigan en spam.
- [ ] 9. Dejar el estrella `52318904` **pendiente** (si se probó su flujo, correr
      `npm run db:reset` + `npm run db:demo` para restaurar el caso demo).

## 1. Base de datos (Supabase)

1. Proyecto de Supabase creado (plan gratuito sirve para el piloto).
2. Aplicar el esquema. Dos vías:
   - **Script (recomendado):** con `SUPABASE_DB_URL` en `.env.local`,
     `npm run db:reset` corre `01→02→03→04` y crea/enlaza los usuarios de Auth.
     Vuelve a correrlo cuando cambie cualquier `.sql` (deja la base reproducible).
   - **Manual:** ejecutar en el editor SQL, en orden: `supabase/01-schema.sql`,
     `02-rls.sql`, `03-funciones.sql`, `04-seed.sql`; luego crear los usuarios de Auth.
3. **Importante:** `db:setup` re-siembra colaboradores y borra `auth_user_id`; por eso
   `db:reset` corre también `db:auth`. Usa siempre `db:reset`, no `db:setup` solo.

## 2. Variables de entorno

Copiar `.env.example` a `.env.local` (local) o cargarlas en el hosting. Necesarias:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo servidor (scripts, resumen diario). Nunca al cliente |
| `SUPABASE_DB_URL` | Solo scripts locales (`db:*`). Session pooler, puerto 5432 |
| `NEXT_PUBLIC_EMPRESA_SLUG` | Empresa activa (`acueducto`) |
| `RESEND_API_KEY` / `RESEND_FROM` | Correo. `RESEND_FROM` usa dominio verificado en prod |
| `RESUMEN_EMAIL` | Destino del resumen diario a Kidotoy |
| `CRON_SECRET` | Protege `/api/resumen-diario` |

`.env.local` está gitignored: nunca se versiona.

## 3. Aplicación (Next.js)

```
npm install          # instala dependencias (usa el .npmrc de proyecto = registro público)
npm run build        # build de producción
npm run start        # sirve en :3000
```

Hosting sugerido para el piloto: cualquiera que corra Next.js 15 (Node 18+). Requiere
HTTPS para la cámara del escáner QR de `/entrega` (los navegadores solo dan cámara en
HTTPS o localhost).

## 4. Dos cron externos (obligatorios antes de entregar)

1. **Keepalive** — `GET /api/keepalive` cada 24 h (evita que Supabase se pause a los 7
   días). Ej. cron-job.org o GitHub Actions. Ver README.
2. **Resumen diario** — `GET /api/resumen-diario` con header `x-cron-secret: <CRON_SECRET>`
   (o `?secret=<CRON_SECRET>`), una vez al día.

## 5. Usuarios del piloto (demo)

- Colaborador estrella: cédula `52318904` · código `SAP-007340` (3 hijos: 3, 7, 12).
- `admin@kidotoy.local` / `Kidotoy#2026` · `rrhh@acueducto.local` / `Acueducto#2026`
- `entrega@kidotoy.local` / `Entrega#2026` · `dev@kidotoy.local` / `DevKidotoy#2026`

Datos de demostración: `npm run db:demo` deja un caso realista (70% de avance, entregas en
curso, una referencia agotada), con el estrella pendiente para el recorrido.

## 6. Antes de producción (no piloto)

Ver la sección "Pendientes de producción" en `PROGRESO.md`. Lo crítico:
- Plan **Pro de Supabase** (concurrencia de Realtime con ~500 personas el mismo día).
- **Dominio verificado en Resend** y volumen (el plan gratuito son ~100 correos/día).
- **Generador de usuarios de operario** (uno por persona, para que la auditoría sirva).
- Datos reales de colaboradores/menores solo con contrato y política de tratamiento.
