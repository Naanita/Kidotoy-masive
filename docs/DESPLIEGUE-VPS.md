# Despliegue de PRODUCCIÓN en VPS

Plataforma multi-empresa con **subdominios por cliente**
(`acueducto.regalos.kidotoy.com`, `empresa2.regalos.kidotoy.com`), en un VPS de la cuenta
de **Kidotoy**.

El piloto vive en otro sitio y es desechable: `docs/DESPLIEGUE-CLOUDFLARE.md`.

**Fecha:** 5 de septiembre de 2026.

---

## 0. Por qué VPS y no Cloudflare

| Razón | Detalle |
|---|---|
| **Comodín en DNS** | Con un servidor real son dos registros A. Con Cloudflare habría que mover los **nameservers del dominio entero** a Cloudflare, metiendo el sitio actual de Kidotoy en el camino |
| **Titularidad** | La infraestructura queda a nombre de Kidotoy, como se acordó. En Cloudflare quedaría en la cuenta de Sebastián |
| **Sin restricciones de runtime** | Sin adaptador, sin tope de bundle, sin sistema de archivos virtual. Código portable |
| **ISR y sistema de archivos** | Funcionan nativos, sin caché externa ni módulos generados |

Anidar bajo `regalos.kidotoy.com` es lo que permite **no tocar el sitio actual**: se añaden
dos registros dentro de ese subdominio y la web de Kidotoy sigue exactamente igual.

---

## 1. PREREQUISITO DE CÓDIGO: resolver la empresa por subdominio

**Esto hay que construirlo antes de producción. Hoy no existe.**

La aplicación resuelve hoy la empresa activa con la variable
`NEXT_PUBLIC_EMPRESA_SLUG`, es decir **una sola empresa por despliegue**. Con subdominios
hay que leerla del **Host**.

**La buena noticia: es un cambio pequeño y acotado.** El aislamiento de datos ya está
resuelto y no se toca — cada usuario lleva su `empresa_id` en el JWT (`app_metadata`) y RLS
filtra por ahí. Lo único que depende de la variable son **dos archivos**:

| Archivo | Qué hace hoy | Qué tiene que hacer |
|---|---|---|
| `lib/theme/config.ts` | Lee el slug de la variable para pintar el tema y la marca en el login, **antes de que exista sesión** | Sacar el slug del **Host** de la petición |
| `app/api/resumen-diario/route.ts` | Usa el slug para el resumen | Recorrer las empresas activas, o recibir el slug por parámetro |

Y en base de datos: `empresas.slug` ya existe y es `unique`. El subdominio **es** el slug.

Qué NO hay que tocar:

- El aislamiento entre empresas (RLS + `empresa_id` en el JWT) — ya funciona.
- La atomicidad del inventario ni el bloqueo por intentos — viven en Postgres.
- El resto de pantallas: todas resuelven la empresa desde la sesión.

> **Añadir un cliente nuevo debe ser un `INSERT` en `empresas` + sus colaboradores.** Con el
> comodín en DNS y el certificado comodín, no hay gestión de infraestructura por cliente.
> Ese es el objetivo de todo este montaje.

---

## 2. El VPS

Hostinger VPS (o cualquier otro con IP pública y acceso root). Ubuntu 22.04 o 24.04.

**Dimensionamiento.** En el día pico, ~500 colaboradores entrando a la vez tras el comunicado
de Recursos Humanos. Next.js con SSR es bastante más pesado que PHP: **2 vCPU / 8 GB** como
punto de partida razonable, y observar. El cuello no va a ser la base (Supabase) sino el
render.

### 2.1 Base del sistema

```bash
adduser kidotoy && usermod -aG sudo kidotoy
# a partir de aquí, como kidotoy
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw

# Node 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # v22.x

# Cortafuegos: solo SSH y web
sudo ufw allow OpenSSH && sudo ufw allow 80 && sudo ufw allow 443
sudo ufw enable
```

### 2.2 La aplicación

```bash
cd /var/www && sudo mkdir kidotoy && sudo chown kidotoy:kidotoy kidotoy
git clone https://github.com/Naanita/Kidotoy-masive.git kidotoy
cd kidotoy
npm ci
```

Crea `/var/www/kidotoy/.env.local` con las variables del punto 6, y luego:

```bash
npm run build
```

> **Las `NEXT_PUBLIC_*` se incrustan en el build.** Tienen que existir **antes** de
> `npm run build`. Si no, compila igual y el sitio sale roto sin un solo error en el log.

### 2.3 Servicio con systemd

`/etc/systemd/system/kidotoy.service`:

```ini
[Unit]
Description=Plataforma de regalos Kidotoy
After=network.target

[Service]
Type=simple
User=kidotoy
WorkingDirectory=/var/www/kidotoy
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=/var/www/kidotoy/.env.local
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now kidotoy
sudo systemctl status kidotoy
curl -I http://127.0.0.1:3000        # 200
```

`Restart=always` es lo que hace que se levante sola si el proceso muere o el VPS reinicia.

---

## 3. DNS: el comodín

En el DNS de **kidotoy.com** (hoy en Hostinger), dos registros anidados bajo `regalos`:

| Tipo | Nombre | Valor | Para qué |
|---|---|---|---|
| `A` | `regalos` | `IP_DEL_VPS` | La raíz, para redirigir o una portada |
| `A` | `*.regalos` | `IP_DEL_VPS` | **Todos** los subdominios de empresa |

Con esos dos, `acueducto.regalos.kidotoy.com` y cualquier `empresa-nueva.regalos.kidotoy.com`
resuelven al VPS **sin tocar DNS nunca más**. El sitio actual de Kidotoy no se roza: vive en
`kidotoy.com` y `www`, fuera de este subárbol.

Verificar:

```bash
dig +short regalos.kidotoy.com
dig +short cualquier-cosa.regalos.kidotoy.com   # misma IP
```

---

## 4. El certificado comodín — el punto delicado

Un comodín en DNS exige un **certificado TLS comodín** (`*.regalos.kidotoy.com`), y Let's
Encrypt **no** los emite por validación HTTP: exige **validación DNS-01**, o sea publicar un
registro TXT en `_acme-challenge.regalos.kidotoy.com`. Y como el certificado se renueva cada
~90 días, eso tiene que ser **automático**: hace falta acceso programático al DNS.

Ahí está el problema: **no existe módulo de Hostinger DNS mantenido para Caddy** (los
proveedores de Caddy salen de `libdns`, y no hay uno de Hostinger).

### Las tres salidas, de mejor a peor

#### Opción A — Delegar SOLO el subdominio (recomendada)

Se delega `regalos.kidotoy.com` a un DNS con API sólida (Cloudflare DNS, gratis) mediante
registros `NS`. **La zona de `kidotoy.com` se queda en Hostinger y el sitio actual no se toca
ni un poco** — solo ese subárbol se gestiona en otro sitio.

En el DNS de Hostinger:

| Tipo | Nombre | Valor |
|---|---|---|
| `NS` | `regalos` | `ns1.cloudflare.com` |
| `NS` | `regalos` | `ns2.cloudflare.com` |

*(los nameservers exactos los da Cloudflare al crear la zona `regalos.kidotoy.com`)*

Y los dos registros `A` del punto 3 se crean **en Cloudflare**, no en Hostinger.

Ventajas: el módulo `caddy-dns/cloudflare` está muy probado, la renovación es automática y
desatendida, y es gratis. **Resuelve la objeción de fondo**: no hay que mover los
nameservers del dominio, solo delegar una rama.

#### Opción B — acme-dns

Un servidor mínimo que solo sirve `_acme-challenge`. Se añade **un** CNAME:
`_acme-challenge.regalos.kidotoy.com` → el registro que da acme-dns. Independiente del
proveedor, el DNS se queda entero en Hostinger.

Cuesta un servicio más que mantener. Es la salida si el cliente no quiere delegar nada.

#### Opción C — certbot con el plugin de Hostinger

Hostinger **sí** tiene API con permisos de DNS (token desde hPanel → Domains → API). Existe
`certbot-dns-hostinger`, que crea y borra los TXT por esa API:

```bash
certbot certonly --dns-hostinger \
  --dns-hostinger-credentials ~/.secrets/certbot/hostinger.ini \
  -d regalos.kidotoy.com -d '*.regalos.kidotoy.com'
```

**Pero es un plugin de comunidad muy pequeño** (2 estrellas, 11 commits, sin respaldo
oficial). De él depende una renovación automática cada 90 días en la infraestructura del
cliente. Si se abandona o la API cambia, el certificado caduca y **la plataforma entera deja
de cargar**. No lo recomiendo para producción.

### 4.1 Caddy con la opción A

Caddy resuelve HTTPS solo, incluida la renovación. Hace falta un binario con el módulo de DNS:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

# binario con el módulo de Cloudflare DNS
sudo apt install -y golang-go
go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
~/go/bin/xcaddy build --with github.com/caddy-dns/cloudflare
sudo systemctl stop caddy
sudo mv ./caddy /usr/bin/caddy
sudo systemctl start caddy
caddy list-modules | grep cloudflare      # debe aparecer dns.providers.cloudflare
```

En Cloudflare, crea un **API Token** con permiso `Zone / DNS / Edit` acotado a la zona
`regalos.kidotoy.com`. Guárdalo:

```bash
echo 'CF_API_TOKEN=el-token' | sudo tee /etc/caddy/cloudflare.env
sudo chmod 600 /etc/caddy/cloudflare.env
sudo systemctl edit caddy     # añadir: [Service] / EnvironmentFile=/etc/caddy/cloudflare.env
```

`/etc/caddy/Caddyfile`:

```caddyfile
# Un solo bloque atiende TODOS los subdominios de empresa. Añadir un cliente
# NO toca este archivo: es un INSERT en la base y ya.
*.regalos.kidotoy.com, regalos.kidotoy.com {
	tls {
		dns cloudflare {env.CF_API_TOKEN}
		# El comodín exige validación DNS-01: Let's Encrypt no emite
		# certificados comodín por validación HTTP.
	}

	encode zstd gzip
	reverse_proxy 127.0.0.1:3000 {
		# La aplicación resuelve la empresa por el Host, así que hay que
		# pasarlo tal cual (ver punto 1).
		header_up Host {host}
		header_up X-Forwarded-Proto {scheme}
	}
}
```

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
sudo journalctl -u caddy -f      # ver la emisión del certificado
```

La primera emisión tarda un par de minutos. A partir de ahí Caddy renueva solo.

---

## 5. Los dos cron

En el VPS son crontab del sistema. Sin worker propio, sin servicio externo.

```bash
crontab -e
```

```cron
# Keepalive: Supabase pausa el proyecto tras 7 días sin actividad.
# (En plan Pro deja de ser crítico, pero no estorba.)
0 4 * * * curl -fsS https://acueducto.regalos.kidotoy.com/api/keepalive > /dev/null

# Resumen diario a Kidotoy.
30 7 * * * curl -fsS -H "x-cron-secret: EL_SECRETO" https://acueducto.regalos.kidotoy.com/api/resumen-diario > /dev/null
```

**El crontab del sistema va en hora local del VPS.** Ponlo en Bogotá para no hacer cuentas:

```bash
sudo timedatectl set-timezone America/Bogota
date
```

Probar sin esperar:

```bash
curl -i https://acueducto.regalos.kidotoy.com/api/keepalive
curl -i -H "x-cron-secret: EL_SECRETO" https://acueducto.regalos.kidotoy.com/api/resumen-diario
```

> Con varias empresas, el resumen diario tiene que recorrerlas (ver punto 1) o habrá una
> línea de cron por empresa — que es exactamente el trabajo manual que se quería evitar.

---

## 6. Variables de entorno

En `/var/www/kidotoy/.env.local`, propiedad de `kidotoy` y `chmod 600`.

| Variable | Tipo | Nota |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | **Necesaria en el build** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | **Necesaria en el build** |
| `SUPABASE_SERVICE_ROLE_KEY` | 🔒 Secreta | Salta RLS. Solo servidor |
| `RESEND_API_KEY` | 🔒 Secreta | |
| `CRON_SECRET` | 🔒 Secreta | El mismo del crontab |
| `RESEND_FROM` | Texto | Dominio verificado de Kidotoy |
| `RESUMEN_EMAIL` | Texto | |
| `SUPABASE_DB_URL` | 🔒 Secreta | **Solo si vas a correr los scripts de base en el VPS.** Si los corres desde tu máquina, no la pongas aquí |
| `NEXT_PUBLIC_EMPRESA_SLUG` | — | **Desaparece** cuando se implemente el punto 1 |

```bash
chmod 600 /var/www/kidotoy/.env.local
```

---

## 7. Despliegue de cambios

```bash
cd /var/www/kidotoy
git pull
npm ci
npm run build
sudo systemctl restart kidotoy
```

`next build` deja el build anterior sirviendo hasta el `restart`, así que la ventana de corte
son un par de segundos. Si hace falta cero corte, la solución es dos procesos alternados
detrás de Caddy — no antes de que haga falta.

**Vale la pena automatizarlo** con un webhook o una GitHub Action por SSH, pero no antes de
que el flujo manual esté probado.

---

## 8. Verificación

### Infraestructura

- [ ] `dig +short regalos.kidotoy.com` → IP del VPS
- [ ] `dig +short loquesea.regalos.kidotoy.com` → **misma IP** (el comodín funciona)
- [ ] `https://acueducto.regalos.kidotoy.com` carga con **candado válido**
- [ ] `https://inventada.regalos.kidotoy.com` **también** tiene certificado válido (es lo que
      prueba que el comodín se emitió, aunque la app responda que no existe la empresa)
- [ ] **El sitio actual de Kidotoy sigue igual**: `kidotoy.com` y `www.kidotoy.com` intactos
- [ ] `sudo systemctl status kidotoy` y `caddy` → ambos `active (running)`
- [ ] Reiniciar el VPS y confirmar que **todo vuelve solo**

### Multi-empresa

- [ ] `acueducto.regalos.kidotoy.com` pinta el tema y la marca del Acueducto
- [ ] Un `INSERT` de una empresa nueva + su subdominio responde **sin tocar DNS ni Caddy**
- [ ] Un usuario de la empresa A **no ve** datos de la empresa B (RLS)

### Aplicación

Los mismos recorridos de `DESPLIEGUE-CLOUDFLARE.md`, punto 8: los cinco accesos, el caso
estrella completo, Realtime con dos pestañas, escaneo de QR desde el celular, correo real,
los tres espacios restantes y consola limpia.

### Los cron

- [ ] `/api/keepalive` responde **200**
- [ ] `/api/resumen-diario` sin secreto responde **401**
- [ ] Al día siguiente, `grep CRON /var/log/syslog` muestra las dos ejecuciones
- [ ] Llegó el resumen diario

### Certificados

- [ ] `sudo caddy list-certificates` muestra el comodín
- [ ] Anotar la fecha de caducidad y **verificar la renovación automática** antes de los 90
      días. Es lo que tumba la plataforma entera si falla, y falla en silencio

---

## 9. Pendientes de producción que este documento NO resuelve

- **Plan Pro de Supabase.** La concurrencia de Realtime con ~500 colaboradores el mismo día
  no cabe en las 200 conexiones del gratuito. También habilita respaldos.
- **Resend con dominio verificado** de Kidotoy y plan con volumen: el gratuito da ~100
  correos al día y el día pico se pasa.
- **Contrato firmado y política de tratamiento de datos** del Acueducto. Sin eso no se cargan
  datos reales de menores.
- **Respaldos del VPS**, además de los de Supabase.
- **Monitoreo**: hoy nadie se entera si el servicio se cae de madrugada.
- **El punto 1 de este documento** (resolver la empresa por subdominio), que es
  prerrequisito de todo lo demás.

Lista completa en `docs/ESTADO-ACTUAL.md`, punto 9.
