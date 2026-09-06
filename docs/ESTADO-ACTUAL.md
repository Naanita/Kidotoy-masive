# Estado actual del proyecto · Plataforma de selección de regalos

**Cliente directo:** Kidotoy · **Usuario final:** Empresa de Acueducto y Alcantarillado de Bogotá
**Fase:** piloto con datos ficticios, sobre infraestructura de Sebastián
**Fecha del documento:** 5 de septiembre de 2026

Este documento se levantó verificando el código y consultando la base de datos en vivo, no
desde notas. Las cifras del punto 6 son las que la base tiene en este momento.

> **Para armar presentaciones:** el punto 8 separa lo que existe de lo que no. Nada de lo
> que no aparezca en la lista de "hecho y verificado" debería prometerse.

---

## 1. Mapa de rutas

### Rutas de aplicación

| Ruta | Quién entra | Qué hace | Acceso |
|---|---|---|---|
| `/` | Cualquiera | Login del colaborador: cédula + código SAP | **Pública** |
| `/inicio` | Colaborador | "Mis beneficiarios": sus hijos y el estado de cada uno | Protegida |
| `/beneficiario/[id]` | Colaborador | Catálogo: las 6 referencias de la edad y género exactos de ese hijo | Protegida |
| `/beneficiario/[id]/confirmar/[producto]` | Colaborador | Pantalla de confirmación con la advertencia de irreversibilidad | Protegida |
| `/beneficiario/[id]/comprobante` | Colaborador | Comprobante con código de entrega y QR | Protegida |
| `/kidotoy` | Administración Kidotoy | Login correo + contraseña | **Pública** |
| `/kidotoy/panel` | Kidotoy | Resumen: avance, evolución, cobertura por grupo | Protegida |
| `/kidotoy/selecciones` | Kidotoy | Selecciones en vivo, filtros, liberar una selección | Protegida |
| `/kidotoy/inventario` | Kidotoy | Stock por referencia, edición del total | Protegida |
| `/kidotoy/entregas` | Kidotoy | Entregas registradas, revertir una entrega | Protegida |
| `/kidotoy/carpas` | Kidotoy | Crear/renombrar carpas y asignarles referencias | Protegida |
| `/kidotoy/operarios` | Kidotoy | Alta de operarios y su carpa | Protegida |
| `/kidotoy/catalogo` | Kidotoy | Crear y editar referencias | Protegida |
| `/empresa` | Recursos Humanos del Acueducto | Login correo + contraseña | **Pública** |
| `/empresa/panel` | Acueducto | Avance, quiénes faltan, alertas de disponibilidad baja | Protegida |
| `/empresa/selecciones` | Acueducto | Consulta de selecciones (solo lectura) | Protegida |
| `/entrega` | Operario | Login correo + contraseña | **Pública** |
| `/entrega/panel` | Operario | Buscar por código o cédula y marcar entregado | Protegida |
| `/dev` | Solo Sebastián | Login del panel interno | **Pública, sin enlazar** |
| `/dev/panel` | `admin_dev` | Panel de desarrollo | Protegida |
| `/dev/tema` | `admin_dev` | Editor de tokens de diseño en vivo | Protegida |
| `/showcase` | — | Escaparate de componentes. **Devuelve 404 en producción** (`NODE_ENV === "production"`) | Solo desarrollo |

### Rutas de servidor (sin interfaz)

| Ruta | Qué hace | Acceso |
|---|---|---|
| `/api/keepalive` | Llama la función `ping()` para que Supabase no pause el proyecto | Pública, pensada para un cron externo |
| `/api/resumen-diario` | Envía el resumen diario a Kidotoy | Protegida por `CRON_SECRET` (cabecera `x-cron-secret` o `?secret=`) |
| `/kidotoy/selecciones/export` | CSV de selecciones | Protegida |
| `/kidotoy/entregas/export` | CSV de entregas | Protegida |
| `/empresa/selecciones/export` | CSV de selecciones | Protegida |
| `/empresa/pendientes/export` | CSV de colaboradores pendientes | Protegida |

### Redirecciones

El espacio del colaborador vivía en `/acceso` y se movió a la raíz. Quedan tres
redirecciones **permanentes (308)** en `next.config.mjs` para no romper enlaces ya
repartidos (correo de Talento Humano, comprobantes guardados, QR impresos):

| Ruta vieja | Ruta nueva |
|---|---|
| `/acceso` | `/` |
| `/acceso/inicio` | `/inicio` |
| `/acceso/beneficiario/:ruta*` | `/beneficiario/:ruta*` |

`/dev` no se enlaza desde ninguna parte: ni menús, ni navegación, ni pie de página. Se
llega solo escribiendo la URL.

---

## 2. Los espacios y sus pantallas

### 2.1 Colaborador (raíz del sitio)

Es lo más importante del producto. La mayoría entra desde el celular, muchos sin ser gente
técnica, con un código que les llegó por correo interno.

**`/` — Login**
Composición partida: panel azul del Acueducto a la izquierda (logo blanco, foto de
bienvenida con forma orgánica y contorno turquesa, titular sobre la foto) y a la derecha,
sobre lienzo blanco azulado, la tarjeta de credenciales.
*Acciones:* ingresar cédula + código SAP.
*Lleva a:* `/inicio`, con una transición animada de bienvenida.
*Estados:* normal · enviando (botón bloqueado con spinner) · error de credenciales (los dos
campos marcados y un mismo mensaje genérico para los tres casos posibles — cédula que no
existe, código incorrecto, cuenta bloqueada) · `prefers-reduced-motion` (sin animación).

**`/inicio` — Mis beneficiarios**
Encabezado con el logo del Acueducto y "Portal de bienestar" debajo, píldora "Regalos en
alianza con Kidotoy", saludo grande y una tarjeta de color por hijo con su silueta.
*Acciones:* tocar una tarjeta · cerrar sesión.
*Lleva a:* catálogo (si falta elegir) o comprobante (si ya eligió).
*Estados:* con hijos pendientes · con hijos confirmados (la tarjeta suma divisor, miniatura
y nombre del juguete) · todos listos (cambia el texto de apoyo) · **vacío** (sin
beneficiarios cargados, con explicación) · cargando (esqueleto).

**`/beneficiario/[id]` — Catálogo**
Las 6 referencias de la edad **exacta** y el género del beneficiario. Indicador de
disponibilidad en vivo.
*Acciones:* elegir una referencia.
*Lleva a:* la pantalla de confirmación.
*Estados:* normal · **agotado** (referencia sin stock, deshabilitada) · **últimas unidades**
(chip cuando quedan 3 o menos) · **fuera de periodo** (antes de abrir o después de cerrar:
se puede mirar, no confirmar) · cargando (esqueleto) · redirección automática al
comprobante si ese hijo ya tiene regalo.

**`/beneficiario/[id]/confirmar/[producto]` — Confirmación**
Advertencia explícita de que la elección no se puede cambiar.
*Acciones:* confirmar · cancelar.
*Estados:* normal · error de `confirmar_seleccion()` traducido a español claro (sin stock,
ya tiene selección, fuera de ventana, no autorizado).

**`/beneficiario/[id]/comprobante` — Comprobante**
Código de entrega, QR, juguete elegido y datos del evento.
*Acciones:* copiar el código · descargar · volver.
*Estados:* normal · sin horario del evento (ausencia limpia, no dice "por confirmar") · sin
foto del juguete (preview de marca).

### 2.2 Kidotoy (`/kidotoy`)

Navegación de siete secciones: Resumen · Selecciones · Inventario · Entregas · Carpas ·
Operarios · Catálogo.

| Pantalla | Qué muestra | Acciones | Estados |
|---|---|---|---|
| **Resumen** (`/kidotoy/panel`) | Avance de la campaña, evolución de confirmaciones por día, cobertura por grupo de edad/género | — | normal · sin datos · sesión sin empresa |
| **Selecciones** (`/kidotoy/selecciones`) | Tabla en vivo de quién eligió qué | Filtrar · **liberar una selección** (motivo obligatorio) · exportar CSV | normal · vacío · sin resultados de filtro |
| **Inventario** (`/kidotoy/inventario`) | Stock por referencia y grupo | Editar el total de unidades de una referencia | normal · agotado · stock menor que lo ya consumido (rechazado) |
| **Entregas** (`/kidotoy/entregas`) | Entregas registradas, con operario y si fue fuera de carpa | **Revertir una entrega** (motivo obligatorio) · exportar CSV | normal · **vacío** ("Aún no hay entregas") |
| **Carpas** (`/kidotoy/carpas`) | Carpas del evento y sus referencias | Crear, renombrar, reordenar, asignar referencias | normal · carpa sin referencias |
| **Operarios** (`/kidotoy/operarios`) | Cuentas de operario y su carpa | Crear operario, asignar carpa | normal · vacío |
| **Catálogo** (`/kidotoy/catalogo`) | Referencias del catálogo | Crear y editar referencia (el stock **no** se toca aquí) | normal · código duplicado · datos incompletos |

### 2.3 Acueducto (`/empresa`) — **solo consulta**

No puede editar inventario ni liberar selecciones. Dos secciones: Avance y Selecciones.

| Pantalla | Qué muestra | Acciones | Estados |
|---|---|---|---|
| **Avance** (`/empresa/panel`) | Cifras del resumen ejecutivo, lista de colaboradores pendientes con cuántos hijos les faltan, alerta de referencias con disponibilidad baja | Exportar pendientes (CSV) | normal · **"No queda nadie pendiente"** · sin alertas de stock |
| **Selecciones** (`/empresa/selecciones`) | Consulta de selecciones | Filtrar · exportar CSV | normal · vacío |

### 2.4 Entrega (`/entrega`)

Pensado para usarse de pie, con una mano, en una carpa al aire libre: botones grandes,
contraste alto, mínimo texto.

**`/entrega/panel`**
*Acciones:* buscar por código de entrega o por cédula · escanear QR · marcar entregado.
*Estados:* búsqueda vacía · **código no existe** · ficha encontrada (juguete, beneficiario,
carpa) · **aviso de carpa distinta** (no bloquea la entrega, la marca `fuera_de_carpa`) ·
**ya entregado** (pantalla roja con quién y cuándo) · entrega registrada.

### 2.5 Dev (`/dev`) — solo Sebastián

| Pantalla | Qué hace |
|---|---|
| **`/dev/panel`** | Panel de desarrollo |
| **`/dev/tema`** | Editor de los tokens de diseño en vivo, con vista previa y guardado en la tabla `tema` |

---

## 3. Modelo de datos

### Tablas

| Tabla | Propósito |
|---|---|
| `empresas` | La empresa cliente: fecha de corte, ventana de selección, datos del evento |
| `tema` | Tokens de diseño por empresa (los edita `/dev/tema`) |
| `colaboradores` | Personal del Acueducto: cédula, código SAP, correo, área |
| `beneficiarios` | Hijos de cada colaborador, con edad **materializada** y género |
| `productos` | Catálogo: código de referencia, SKU, edad, género, stock e imagen |
| `carpas` | Puntos físicos de entrega del evento |
| `carpa_referencias` | Qué referencias se despachan en cada carpa |
| `operarios` | Cuentas de operario y la carpa que atienden |
| `selecciones` | El regalo elegido por beneficiario, con su código de entrega |
| `entregas` | Entrega física registrada, con operario, carpa y si fue fuera de carpa |
| `intentos_acceso` | Historial de intentos de login por cédula (para el bloqueo) |
| `auditoria` | Registro de toda mutación relevante |

**Restricciones que sostienen las reglas de negocio**

- `selecciones` tiene un `unique` sobre `beneficiario_id`: **un juguete por beneficiario**,
  garantizado por la base, no solo por la aplicación.
- `productos` tiene `unique (empresa_id, codigo_referencia)` y `check (stock_disponible <= stock_inicial)`.
- `productos.edad` está acotada entre 0 y 13, y `genero` a `'Niño' | 'Niña'`.
- Toda tabla lleva `empresa_id` y tiene RLS activo, aunque hoy solo exista una empresa.

**Columnas con matiz**

- `beneficiarios.edad` está **materializada** contra `empresas.fecha_corte`, nunca contra
  `now()`. Se recalcula con `recalcular_edades()`.
- `productos.sku` es el código físico de bodega. Un juguete unisex ocuparía dos filas con
  distinto `codigo_referencia` y el **mismo** `sku`.
- `entregas.carpa_id` es la carpa **asignada a la referencia** (dónde debía despacharse),
  no la edad del niño. El avance por carpa agrupa por esta columna.
- `entregas.fuera_de_carpa` marca que el operario despachó desde otro punto. No se bloquea;
  queda registrado para cuadrar el conteo.
- `entregas.sincronizado_en` está reservado para el modo sin conexión de producción, que
  **no está construido**.

### Funciones

| Función | Qué hace | Qué garantiza |
|---|---|---|
| **`confirmar_seleccion(beneficiario, producto)`** | Descuenta una unidad y crea la selección con su código de entrega | **ATÓMICA.** Ver abajo |
| `liberar_seleccion(seleccion, motivo)` | Deshace una selección y devuelve la unidad al stock | Solo admin · motivo obligatorio · rechaza si ya se entregó (`YA_ENTREGADO`) · deja auditoría |
| `actualizar_stock(producto, nuevo_total)` | Fija el total de unidades de una referencia | **ATÓMICA.** `SELECT … FOR UPDATE` serializa contra `confirmar_seleccion()`. El nuevo total nunca puede quedar por debajo de lo ya consumido (`STOCK_MENOR_QUE_CONSUMIDO`) |
| `crear_producto(…)` / `actualizar_producto(…)` | Gestión de catálogo | Solo admin · valida edad, género y datos · rechaza código duplicado · deja auditoría. **No tocan el stock** |
| **`registrar_entrega(codigo, …)`** | Registra la entrega física | Valida que el código exista · asigna la carpa de la referencia · marca `fuera_de_carpa` si el operario es de otro punto, sin bloquear |
| `revertir_entrega(entrega, motivo)` | Deshace una entrega marcada por error | Solo admin · motivo de 10 caracteres mínimo · deja auditoría · devuelve la selección a "confirmada, sin entregar" |
| `recalcular_edades(empresa)` | Recalcula la edad de todos los beneficiarios contra la fecha de corte | Se usa si cambia `empresas.fecha_corte` |
| `verificar_intentos(cedula)` | Dice si una cédula puede intentar entrar | Ventana deslizante de 15 minutos, 5 fallos. Ejecutable por `anon` |
| `registrar_intento_acceso(cedula, exitoso, ip)` | Deja constancia del intento | Un fallo grabado es **inmutable**: no hay forma desde `anon` de volverlo exitoso y limpiar el historial. Ejecutable por `anon` |
| `ping()` | Devuelve la hora del servidor | Actividad para el keepalive del plan gratuito, sin exponer la clave de servicio. Ejecutable por `anon` |
| `config_publica(slug)` | Devuelve lo mínimo para pintar el login antes de que exista sesión: nombre visible y tokens de tema | Ejecutable por `anon`. No expone id, slug ni datos de negocio |

Todas son `SECURITY DEFINER` con `search_path` fijo. Las cuatro que `anon` puede ejecutar
están explícitamente concedidas; el resto exige sesión con el rol correspondiente.

### Vistas

| Vista | Qué entrega |
|---|---|
| `v_avance_campana` | Total de beneficiarios, confirmados, pendientes y porcentaje |
| `v_inventario_por_grupo` | Por edad y género: referencias, unidades iniciales, disponibles y consumidas |

### Operaciones atómicas — y por qué importa

**`confirmar_seleccion()` es lo más delicado del sistema.** En producción cerca de mil
personas seleccionan en la misma ventana, con picos cuando Recursos Humanos manda el
comunicado. El riesgo real es que dos colaboradores confirmen la última unidad de la misma
referencia en el mismo instante.

Se resuelve con **un único `UPDATE … WHERE stock_disponible > 0`**: Postgres serializa las
escrituras sobre la misma fila, así que el segundo intento no encuentra fila y recibe
`SIN_STOCK`. La condición de stock va *dentro* del `UPDATE`, nunca en un `SELECT` previo.

La función además valida, en la base y no solo en la interfaz:

- que el beneficiario exista;
- que el colaborador solo pueda elegir para **sus** hijos;
- que ese beneficiario no tenga ya una selección;
- que se esté **dentro de la ventana** de selección (un botón deshabilitado no es una
  restricción);
- que el producto corresponda a la **edad y género exactos** del niño.

**`actualizar_stock()` también es atómica**, por una razón distinta: usa `SELECT … FOR
UPDATE` para que, si un colaborador está tomando una unidad de esa misma referencia, el
consumido se lea sin condición de carrera.

**Realtime es solo cosmético.** Sirve para que la disponibilidad se vea actualizada en
pantalla. Nunca es fuente de verdad: la verdad la dicta el retorno de
`confirmar_seleccion()`.

---

## 4. Autenticación y roles

### Cómo entra cada quien

| Usuario | Credencial | Mecanismo |
|---|---|---|
| Colaborador | Cédula + código SAP | Supabase Auth con **correo sintético** `{cedula}@acueducto.interno` y contraseña = código SAP |
| Kidotoy, Acueducto, operario, dev | Correo + contraseña | Supabase Auth normal |

En todos los casos hay JWT real y RLS funcionando; no se construyó manejo de sesión propio.
`empresa_id` y `rol` viven en `app_metadata`.

### Roles

`colaborador` · `admin_kidotoy` · `empresa_cliente` · `operario_entrega` · `admin_dev`

### Bloqueo por intentos

**La cédula no es un dato secreto**: es semipública y adivinable. El único elemento
reservado del par es el código SAP. Por eso el bloqueo no es opcional ni siquiera en el
piloto.

- Ventana deslizante de **15 minutos**, **5 fallos** por cédula.
- Se cuenta **por cédula, nunca por IP**: los colaboradores del Acueducto probablemente
  salen por una IP corporativa compartida y contar por IP bloquearía a toda la oficina. La
  IP se guarda solo para auditoría.
- **El mensaje es el mismo para todos los casos**, incluido durante el bloqueo. No revela si
  la cédula existe, ni si hay bloqueo, ni cuánto falta. Cambiar el mensaje al quinto intento
  confirmaría que la cédula existe y anularía la protección.
- Un intento fallido, una vez grabado, es **inmutable**.

### Qué protege el middleware

Es la primera barrera de navegación; el aislamiento fuerte vive en RLS.

- Ruta protegida de un espacio sin el rol correcto → al login de ese espacio.
- Ya autenticado en el login de su espacio → a su home.
- Autenticado con otro rol → a la home de **su** espacio.
- Refresca la sesión y arrastra las cookies renovadas a cualquier redirección.
- **No corre sobre `/api/`** ni sobre archivos estáticos: el keepalive no debe pasar por ahí.

El espacio del colaborador vive en la raíz, así que su zona **no se resuelve por prefijo**
(`"/"` se tragaría los otros cuatro espacios): se evalúa de último y contra una lista
explícita de rutas (`/inicio`, `/beneficiario`).

### Credenciales de prueba (datos ficticios)

| Espacio | Usuario | Contraseña |
|---|---|---|
| Colaborador **(caso estrella)** | `52318904` | `SAP-007340` |
| Administración Kidotoy | `admin@kidotoy.local` | `Kidotoy#2026` |
| Portal del Acueducto | `rrhh@acueducto.local` | `Acueducto#2026` |
| Panel de desarrollo | `dev@kidotoy.local` | `DevKidotoy#2026` |

**Operarios de entrega** (todos con contraseña `Entrega#2026`):

| Correo | Nombre | Carpa asignada |
|---|---|---|
| `entrega@kidotoy.local` | Operario Carpa 4 | Carpa edad 4 |
| `carpa7@kidotoy.local` | Operario Carpa 6 | Carpa edad 6 |
| `carpa12@kidotoy.local` | Operario Carpa 10 | Carpa edad 10 |

**Códigos de entrega vigentes** (confirmados y **sin entregar**, listos para demostrar el
módulo de entrega):

| Código | Beneficiario | Edad | Juguete | Carpa |
|---|---|---|---|---|
| `D9329C4CD4` | Jerónimo Salcedo Rojas | 4 | Scooter infantil avión oso | Carpa edad 4 |
| `A46A0DFDE6` | Paulina Beltrán Muñoz | 2 | Cancha Elefante 3 en 1 | Carpa edad 2 |
| `EA032D8BA8` | Valeria Valencia Nieto | 2 | Cancha Elefante 3 en 1 | Carpa edad 2 |
| `5DC7AA0734` | Luciana Naranjo Vega | 2 | Cancha Elefante 3 en 1 | Carpa edad 2 |
| `B8C3FF973F` | Daniel Cárdenas Rojas | 4 | Scooter infantil avión oso | Carpa edad 4 |
| `16455D8A38` | Matías Salcedo Vargas | 4 | Scooter infantil avión oso | Carpa edad 4 |
| `99B5B11742` | Matías Cortés Amaya | 4 | Scooter infantil avión oso | Carpa edad 4 |
| `82E20B7332` | Paulina Salcedo Vargas | 6 | Carro Deportivo Niña C/R Con Humo | Carpa edad 6 |

> **Los códigos cambian con cada `npm run db:demo`.** Se generan al azar en
> `confirmar_seleccion()`. Si se resiembra la base antes de una presentación, hay que volver
> a sacarlos. Para demostrar el aviso de "carpa distinta", basta usar un código de la Carpa
> 2 estando con el operario de la Carpa 4.

---

## 5. Sistema de diseño

Todo el estilo pasa por variables CSS, siguiendo la convención de shadcn/ui. **Ningún color,
tamaño, radio o espaciado se escribe a mano en un componente.**

### Familias de tokens

| Familia | Contenido |
|---|---|
| Superficies y texto | `background`, `foreground`, `card`, `popover`, `muted`, `secondary`, `accent` (y sus `-foreground`) |
| Marca y acción | `primary`, `primary-foreground`, `primary-deep` |
| Estados | `destructive`, `success`, `warning` (y sus `-foreground`) |
| Bordes y foco | `border`, `input`, `ring` |
| Tipografía | `font-display`, `font-heading`, `font-body`, `font-size-base`, `font-scale`, `font-weight-heading` |
| Forma y espacio | `radius`, `spacing-unit`, `density`, `shadow-level` |
| Marca (recursos) | `logo-url`, `logo-dark-url`, `favicon-url`, `marca-nombre` |

La escala de espaciado, la escala tipográfica, los radios y las sombras **se derivan** de
esos tokens en `tailwind.config.ts`. No hay valores fijos: si se fijaran, el panel de temas
mostraría una cosa y la aplicación otra.

### Tipografías

- **Inter** — cuerpo
- **Montserrat** — títulos
- **Fredoka** — display, solo momentos de alegría

Esas tres se precargan. La lista curada que ofrece el panel de temas añade **Plus Jakarta
Sans, Manrope, Source Sans 3, Nunito Sans, Outfit y Figtree**, declaradas pero *no*
precargadas: el navegador solo descarga una cuando el tema realmente la usa.

### Cómo funciona `/dev/tema`

Sebastián ajusta colores, tipografías, radios, espaciados y logos, con vista previa, y
guarda en la tabla `tema`. El layout raíz lee esos valores y los inyecta como un bloque
`:root { … }`.

**Lo importante es la validación.** Los tokens vienen de la base y se inyectan en un
`<style>`, así que pasan por una **lista blanca** de 36 claves editables y un validador por
tipo antes de tocar el HTML:

- **color** (23 tokens): solo el formato HSL en canales, sin la función `hsl()`;
- **length** (3): solo `px`, `rem` o `em`, con magnitud acotada;
- **number** (3): solo numérico;
- **url** (3): solo `https://`;
- **text** (1): el nombre de marca.

Cualquier clave fuera de la lista o cualquier valor que no valide **se descarta en
silencio** y manda el valor por defecto. Si no queda ningún token válido, no se inyecta
nada.

### Marca fija — no cambia con el tema

Estos valores son identidad, igual que el logo, y **no** pasan por `/dev/tema`:

| Token | Valor | Uso |
|---|---|---|
| `--kido-turquesa` | `#10B7CD` | Color de marca Kidotoy (Pantone 3115 C) |
| `--kido-rojo` | `#E84141` | Warm Red C |
| `--kido-amarillo` | `#F8AB11` | Pantone 2010 C |
| `--kido-morado` | `#8974B3` | Pantone 2101 C |
| `--kido-marino` | `#101460` | Secundario |
| `--kido-*-claro` | 4 tintes | Silueta del beneficiario sobre cada tarjeta |
| `--acueducto-azul` | `#135EC3` | Panel del login |
| `--acueducto-azul-vivo` | `#0167D5` | Titulares y tarjeta de credenciales |
| `--acueducto-lienzo` | `#F5FBFB` | Fondo del espacio del colaborador |
| `--acueducto-campo` | `#80C8FF` | Borde de los campos sobre azul |
| `--acueducto-pildora` | `#D4E7F5` | Píldora "Regalos en alianza con" |
| `--gris-decorativo` | `#E6ECEC` | Forma geométrica de fondo |

Los hexes de Kidotoy salen del manual de identidad; los del Acueducto se muestrearon píxel a
píxel del PDF de la propuesta aprobada.

> **No inventar "variantes profundas" de los colores de marca para ganar contraste.** Se
> intentó y el turquesa quedó mostaza y el morado café: se destruye la fidelidad, que era el
> objetivo. El nombre del beneficiario va en texto grande y bold (umbral AA 3:1) y los
> colores del manual pasan ahí.

---

## 6. Datos de demostración

Todos los datos son **ficticios**. No hay información real de colaboradores ni de menores
del Acueducto: no hay contrato firmado ni política de tratamiento definida.

### Lo que la base tiene ahora mismo

| | |
|---|---|
| Colaboradores | **25** |
| Beneficiarios | **40** |
| Referencias de catálogo | **24** |
| Selecciones confirmadas | **28** |
| Entregas registradas | **12** (2 marcadas fuera de carpa) |
| Carpas | 14 creadas · **4 con referencias asignadas** |
| Operarios | 3 |
| Registros de auditoría | 28 |
| Intentos de acceso registrados | 39 |

**Avance de la campaña: 28 de 40 · 70,0 % · 12 pendientes.**

### Cobertura por grupo

| Edad | Género | Referencias | Unidades iniciales | Disponibles | Consumidas | Beneficiarios | Confirmados |
|---|---|---|---|---|---|---|---|
| 2 | Niña | 6 | 48 | 40 | 8 | 11 | 8 |
| 4 | Niño | 6 | 60 | 51 | 9 | 9 | 9 |
| 6 | Niña | 6 | 60 | 54 | 6 | 11 | 6 |
| 10 | Niño | 6 | 60 | 55 | 5 | 9 | 5 |

Se eligieron cuatro grupos separados para que se note que el catálogo cambia de verdad
según la edad y el género. **Cada grupo tiene exactamente 6 referencias**, como manda la
regla de negocio.

### Estados de inventario cargados a propósito

- **Agotada:** `REF7007-2A` — "Cancha Elefante 3 en 1 con Luces y Sonidos" (2 años, Niña).
  Sirve para demostrar la referencia deshabilitada en el catálogo.
- **Últimas unidades:** `REFBX-688` — "Scooter infantil avión oso" (4 años, Niño), con
  **1 unidad disponible**. Sirve para demostrar el chip de aviso y, con dos pestañas, la
  carrera por la última unidad.

### Fotos de producto

**23 de 24 referencias tienen foto real.** Están en Supabase Storage, bucket `catalogo`,
como la ficha completa de Kidotoy con su franja de color, a 800×800 en WebP.

La única sin foto es **`REF7007-2A` / `KDT008183`** — "Cancha Elefante 3 en 1", porque
Kidotoy no envió su ficha. Esa referencia cae al preview de marca, que es el respaldo
diseñado. (Coincide con la agotada, así que en el catálogo aparece deshabilitada.)

### Caso estrella

**Diana Patricia Salcedo Rojas** · cédula `52318904` · código SAP `SAP-007340` · Talento
Humano. Tiene **tres hijos en tres grupos distintos**, que es lo que lo hace el mejor caso
de demostración: tres catálogos completamente diferentes bajo un mismo inicio de sesión.

| Hijo | Edad | Género | Estado | Juguete | Código |
|---|---|---|---|---|---|
| Jerónimo Salcedo Rojas | 4 | Niño | **Confirmado** | Scooter infantil avión oso | `D9329C4CD4` |
| Valentina Salcedo Rojas | 6 | Niña | **Falta elegir** | — | — |
| Andrés Salcedo Rojas | 10 | Niño | **Falta elegir** | — | — |

El recorrido muestra, en una sola sesión: una tarjeta ya confirmada con su miniatura, dos
pendientes, dos catálogos distintos por recorrer, la pantalla de confirmación con su
advertencia, y un comprobante con código y QR. Jerónimo además está **sin entregar**, así
que su código sirve para cerrar el ciclo en el módulo de entrega.

> **No borrar del seed.** Es el caso que sostiene toda la demostración.

---

## 7. Scripts y operación

### Comandos disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Servidor de producción |
| `npm run typecheck` | Verificación de tipos |
| `npm run db:setup` | Aplica el esquema completo a Postgres, en orden estricto |
| `npm run db:auth` | Crea las cuentas de Supabase Auth (colaboradores, personal, operarios) |
| `npm run db:reset` | `db:setup` + `db:auth` |
| `npm run db:demo` | Genera actividad de demostración: selecciones, entregas, avance |
| `npm run catalogo:imagenes` | Prepara las fotos del catálogo y muestra el mapa **sin tocar nada** |
| `npm run catalogo:imagenes -- --aplicar` | Sube a Storage y vincula `productos.imagen_url` |

`db:setup` aplica seis archivos en este orden: `01-schema` → `02-rls` → `03-funciones` →
`04-seed` → `05-storage` → `06-imagenes`. El último lo genera el script de imágenes y es
opcional: si no existe todavía, se salta.

### Orden para dejar la base lista para demostrar

```
1. npm run db:reset                          (esquema + seed + cuentas)
2. npm run catalogo:imagenes -- --aplicar    (fotos en Storage y vinculadas)
3. npm run db:demo                           (avance, selecciones y entregas)
```

Después del paso 3 hay que **volver a sacar los códigos de entrega**: se generan al azar.

`db:setup` hace un teardown previo, así que correrlo dos veces deja la base en el mismo
estado. El script de imágenes también es idempotente: mismo bucket, mismas rutas, misma URL.

### Variables de entorno

Sin valores; van en `.env.local`, que nunca se versiona. La plantilla está en `.env.example`.

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio. **Solo servidor y scripts locales; nunca llega al navegador** |
| `NEXT_PUBLIC_EMPRESA_SLUG` | Empresa activa del piloto |
| `SUPABASE_DB_URL` | Conexión directa a Postgres, solo para los scripts locales |
| `RESEND_API_KEY` | Envío de correo |
| `RESEND_FROM` | Remitente |
| `RESUMEN_EMAIL` | Destino del resumen diario |
| `CRON_SECRET` | Protege `/api/resumen-diario` |

---

## 8. Qué está hecho y qué no

### Hecho y verificado

**Colaborador**
- Login con cédula + código SAP, con bloqueo por intentos.
- "Mis beneficiarios" con estado por hijo.
- Catálogo filtrado por edad **exacta** y género, con 6 opciones.
- Disponibilidad en vivo (Realtime).
- Confirmación con advertencia y bloqueo tras confirmar.
- Comprobante con código de entrega y QR.
- Transición animada de bienvenida del login a beneficiarios (985 ms medidos, respeta
  `prefers-reduced-motion`).
- Verificado en navegador real en escritorio (1440×900) y móvil (390×844).

**Kidotoy**
- Resumen con avance, evolución diaria y cobertura por grupo.
- Selecciones en vivo con filtros y exportación CSV.
- Liberar una selección, con motivo obligatorio y auditoría.
- Inventario con edición del total, protegida contra quedar por debajo de lo consumido.
- Entregas con reversión (motivo obligatorio) y exportación CSV.
- Carpas configurables y asignación de referencias.
- Gestión de operarios con su carpa.
- Gestión de catálogo (crear y editar referencias).

**Acueducto**
- Avance, lista de pendientes y alertas de disponibilidad baja.
- Consulta de selecciones y exportación CSV.
- **Sin** capacidad de editar inventario ni liberar selecciones.

**Entrega**
- Búsqueda por código y por cédula, y escáner QR.
- Registro de entrega con detección de carpa distinta (avisa, no bloquea).
- Pantalla de "ya entregado".

**Transversal**
- Cinco espacios con su propio login y layout.
- RLS activo en todas las tablas, con `empresa_id`.
- Auditoría de toda mutación relevante.
- Panel de temas con validación por lista blanca.
- Correo de confirmación al completar todos los hijos, y resumen diario a Kidotoy.
- `/api/keepalive` contra la pausa del plan gratuito.
- 23 de 24 referencias con foto real en Storage, con lectura pública y escritura cerrada.
- Prueba de dos pestañas sobre la última unidad, en navegador real.

### NO construido

Esta lista es la que importa para no prometer de más.

- **Modo sin conexión del módulo de entrega.** Si se cae la red en la carpa, no hay
  registro local. La columna `entregas.sincronizado_en` existe pero **no la usa nada**.
- **Jornada de rezagados** (segunda vuelta de entrega).
- **Subdominios por empresa.** Hay una sola empresa y se elige por variable de entorno.
- **Importadores de Excel.** Colaboradores, beneficiarios y catálogo entran por seed. No hay
  pantalla de carga de archivos.
- **Reportes avanzados.** Solo hay exportación CSV de cuatro listados.
- **Notificaciones push o SMS.** Solo correo.
- **Recuperación de contraseña / autoservicio de credenciales.** No existe. Si un
  colaborador pierde su código SAP, lo resuelve Recursos Humanos por fuera.
- **Pantalla de administración de colaboradores y beneficiarios.** No se pueden crear ni
  editar desde la interfaz.
- **Gestión multi-empresa desde la interfaz.** El modelo lo soporta; las pantallas no.
- **Carga de fotos desde `/kidotoy`.** El catálogo acepta una URL de imagen escrita a mano;
  subir un archivo se hace con el script local.
- **Nombre del operario en la entrega.** Hoy se registra y se muestra el **correo** de la
  cuenta, no el nombre.
- **Horario del evento.** La columna existe y está vacía a propósito.
- **Enlace de contacto de Recursos Humanos.** Aparece como texto plano, sin `mailto:` ni
  teléfono, porque el dato no existe.
- **Respaldos automáticos de base de datos.** El plan gratuito no los incluye.
- **Pruebas automatizadas.** No hay suite de tests; la verificación fue manual y en
  navegador real.

---

## 9. Pendientes para producción

Ordenados por criticidad dentro de cada responsable.

### Dependen de Sebastián

1. **Plan Pro de Supabase.** La concurrencia de Realtime con ~500 colaboradores el mismo día
   no cabe en las 200 conexiones del plan gratuito. También habilita respaldos. **Bloquea el
   día pico.**
2. **Cron externos conectados:** keepalive cada 24 h y resumen diario. Sin el keepalive, el
   proyecto se pausa a los 7 días sin actividad. Ver `DESPLIEGUE.md`.
3. **Migración a la infraestructura de Kidotoy.** Hoy dominio, base y repositorio son de
   Sebastián. Ocurre solo en producción.
4. **Recorrido físico en celular real** del espacio del colaborador y del módulo de entrega.
   Hasta ahora solo se hizo emulación.
5. **Verificación humana de los correos:** abrir confirmación y resumen en Gmail y Outlook,
   revisar spam, imprimir la confirmación en blanco y negro.
6. **Nombre del operario** en la entrega, en vez del correo. Es solo presentación; el
   identificador ya queda registrado.
7. **Fuente Geist** en el panel de temas: descartada porque exige el paquete `geist`.
   Reactivarla es una decisión de dependencia.

### Dependen de Kidotoy

1. **Catálogo completo de producción:** 168 referencias contra las 24 del piloto, con sus
   edades, géneros y stock.
2. **Ficha de la referencia faltante** (`KDT008183`, Cancha Elefante) y fotos del resto del
   catálogo de producción.
3. **Horario del evento** (`empresas.evento_hora`), que hoy está vacío a propósito.
4. **Dominio verificado en Resend** y plan con volumen. El gratuito da ~100 correos al día y
   3.000 al mes; el día pico se pasa. En el piloto se usó `vaisy.app`.
5. **Mapa real de carpas** del evento: cuántos puntos, cómo se agrupan las edades y qué
   referencias despacha cada uno. Las 14 carpas actuales son un valor por defecto.
6. **Cuentas reales de operario**, una por puesto.

### Dependen del Acueducto

1. **Contrato firmado y política de tratamiento de datos.** Sin eso no se cargan datos
   reales de colaboradores ni de menores. **Bloquea todo lo demás.**
2. **Padrón real** de colaboradores y beneficiarios, con cédula, código SAP, correo y los
   hijos de cada uno.
3. **Correos reales de colaboradores.** El correo de confirmación solo se envía a quienes
   tienen `correo` registrado; el seed usa `@demo.local`, que no es entregable.
4. **Contacto de Recursos Humanos** (correo o extensión) para el hueco del login.
5. **Fecha de corte definitiva** y ventana de selección de producción.

---

## 10. Decisiones persistentes

Estas decisiones no se revierten. Cada una está donde está por una razón concreta; varias
parecen redundantes y no lo son.

**1. El descuento de inventario es atómico, dentro de `confirmar_seleccion()`.**
Nunca leer el stock y después restarlo desde la aplicación: eso es una condición de carrera
garantizada. La condición `stock_disponible > 0` va dentro del `UPDATE`.

**2. `supabase.realtime.setAuth(token)` antes de `subscribe()` en el catálogo.**
El socket de Realtime del navegador conecta como anónimo por defecto. Sin ese `setAuth`, RLS
bloquea todos los eventos y el catálogo deja de actualizarse en vivo **sin ningún error
visible**. No lo detectan el typecheck, ni el build, ni las pruebas por API: solo se ve en
navegador real con sesión.

**3. Los tokens del tema se validan contra lista blanca antes de inyectarse.**
Vienen de la base y terminan dentro de un `<style>`. Sin la lista blanca y el validador por
tipo, sería una vía de inyección.

**4. El bloqueo de acceso se cuenta por cédula, no por IP.**
Los colaboradores del Acueducto probablemente salen por una IP corporativa compartida:
contar por IP bloquearía a toda la oficina. Y el mensaje de error es idéntico en todos los
casos, incluido el bloqueo, para no confirmar qué cédulas existen.

**5. La carpa NO es la edad.**
El juguete está en una carpa, no en una edad. Las carpas son configurables y la asignación
es **por referencia**, para poder juntar dos edades en un punto o partir una edad numerosa
en dos. Si el juguete es de otra carpa se avisa pero **no se bloquea**; queda
`fuera_de_carpa = true`.

**6. La edad se calcula contra `empresas.fecha_corte`, nunca contra `now()`.**
La selección ocurre en un momento y la entrega en otro. Un niño que cumple años a mitad de
campaña cambiaría de grupo y de juguete asignado.

**7. El catálogo se filtra por edad exacta y género, no por rangos.**
Un niño de 7 años ve exactamente las 6 referencias de `edad = 7` y su género. Nunca ve nada
de otra edad ni de otro género, aunque su grupo se quede sin stock.

**8. La confirmación es irreversible para el colaborador.**
Solo un administrador de Kidotoy puede liberar una selección, con motivo obligatorio, y esa
liberación queda en `auditoria`.

**9. El aislamiento entre empresas vive en la base de datos.**
Toda tabla lleva `empresa_id` y tiene RLS activo, aunque hoy solo exista una empresa.

**10. Las claves de servicio nunca llegan al cliente.**
Las funciones que `anon` necesita (`ping`, `config_publica`, `verificar_intentos`,
`registrar_intento_acceso`) son `SECURITY DEFINER` con grant explícito. Nunca se usa la
clave de servicio en una ruta pública.

**11. Los colores de marca no se retocan para ganar contraste.**
Se resuelve con peso de texto y sombra mínima. Y ni el rojo ni el amarillo de Kidotoy se
usan como fondo de tarjeta de beneficiario: sobre el rojo la píldora roja de "Falta elegir"
desaparece, y sobre el amarillo el nombre en blanco queda en 2.0:1.

**12. Los huecos honestos se dejan como texto plano.**
Si una pantalla necesita un dato que todavía no existe (un contacto, un horario), no se
simula ni se deja con apariencia de funcional. Un hueco honesto es mejor que algo que parece
andar y no anda.

**13. Las fotos de producto van con `object-contain`, nunca `object-cover`.**
Con `cover` los juguetes se recortan por los bordes y el colaborador está eligiendo un
regalo a partir de esa foto.

---

## 11. Límites conocidos

Honestamente, esto es lo que pasa hoy en cada caso.

**Un niño está en un grupo sin referencias asignadas**
Ve un catálogo **vacío** y no puede elegir. La regla de edad exacta es deliberada: no cae a
otro grupo. Hoy los cuatro grupos del piloto (2 Niña, 4 Niño, 6 Niña, 10 Niño) tienen sus 6
referencias, así que no ocurre; pero **en producción, con 168 referencias y 28 grupos, es un
riesgo real** si el catálogo llega incompleto. Conviene revisar la cobertura antes de abrir
la campaña — la pantalla de Resumen de Kidotoy la muestra.

**El proyecto de Supabase se pausa**
El plan gratuito pausa el proyecto tras **7 días sin actividad**. Si eso ocurre, la
aplicación deja de responder por completo hasta que alguien la reactive desde el panel de
Supabase. Es un riesgo real para el piloto: va a estar semanas esperando a que el Acueducto
lo abra. Por eso existe `/api/keepalive`, **pero solo protege si hay un cron externo
llamándolo cada 24 horas**. Sin ese cron conectado, la protección no existe.

**Hay más colaboradores de los que aguanta el plan gratuito**
El límite que muerde primero son las **200 conexiones concurrentes de Realtime**. Pasado
ese punto, los que sobran **no reciben las actualizaciones de disponibilidad en vivo**: el
catálogo se les queda con cifras viejas. La selección **sigue funcionando correctamente**,
porque la verdad la dicta `confirmar_seleccion()` y no Realtime; lo que se degrada es el
aviso visual. El síntoma sería que alguien intente elegir algo que ya se agotó y reciba el
mensaje de "sin stock" al confirmar, en vez de verlo deshabilitado antes.
También hay 500 MB de base, que no es el problema (el catálogo con fotos ocupa ~7 MB
proyectados a producción).

**Falla el envío de correo**
El correo es **best-effort y aislado a propósito**. Si Resend está caído, el colaborador no
tiene correo registrado o los datos están incompletos, el fallo se traga en silencio: la
selección ya quedó guardada y el comprobante está en pantalla. **El correo nunca puede
romper ese flujo.** La consecuencia es que el colaborador se queda sin la copia por correo y
depende del comprobante en pantalla, que sí puede copiar y descargar.
Límites del plan gratuito de Resend: ~100 correos al día y 3.000 al mes. **El día pico de
producción los pasa**, y los que excedan simplemente no salen.

**Otros límites del piloto**
- **Sin respaldos automáticos.** Si la base se corrompe o se borra, se reconstruye con
  `db:reset` + `db:demo`, pero las selecciones reales de una demostración se pierden.
- **Sin modo sin conexión.** Si la carpa se queda sin red el día del evento, no se puede
  registrar ninguna entrega.
- **El banner de "versión de demostración" ya no se muestra.** La columna
  `empresas.banner_demo` sigue en la base con valor `true`, pero la interfaz lo retiró: no
  hay ninguna marca visual que avise que los datos son ficticios.
