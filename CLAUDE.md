# CLAUDE.md — Plataforma de selección de regalos · Kidotoy

Contexto permanente del proyecto. Léelo completo antes de escribir código.

---

## Qué estamos construyendo

Plataforma web donde los colaboradores de una empresa eligen el regalo de fin de año
de cada uno de sus hijos, con inventario limitado y descuento en vivo, y donde después
se controla la entrega física de cada obsequio.

- **Cliente directo:** Kidotoy (juguetería)
- **Usuario final:** Empresa de Acueducto y Alcantarillado de Bogotá
- **Escala en producción:** ~500 colaboradores, ~1.000 beneficiarios, ~168 referencias
- **Fase actual:** PILOTO con datos ficticios, corriendo en infraestructura propia

## Regla de oro

El piloto es una herramienta comercial: Kidotoy lo usa para ganar una licitación frente
al Acueducto, y un tercero externo va a entrar a probarlo sin acompañamiento.

**Prioriza que nada se rompa y que el flujo se entienda solo**, por encima de completitud.
Es preferible un alcance corto impecable que uno amplio con bordes ásperos.

Nada se despliega en infraestructura de Kidotoy durante el piloto. Dominio, base de datos
y repositorio son de Sebastián. La migración ocurre solo en producción.

---

## Stack

| Capa | Decisión |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | **shadcn/ui** sobre Tailwind CSS |
| Base de datos | Supabase (Postgres) — plan gratuito |
| Auth | Supabase Auth |
| Tiempo real | Supabase Realtime |
| Correo | Resend |
| Iconos | lucide-react |

No introducir librerías adicionales sin justificarlo. Todo componente visual sale de
shadcn/ui; si algo no existe ahí, se compone con primitivas de shadcn antes de traer
una dependencia nueva.

---

## Los cuatro espacios

Cada uno con su propio inicio de sesión y su propio layout.

| Ruta | Quién entra | Cómo entra |
|---|---|---|
| `/acceso` | Colaborador del Acueducto | Cédula + código SAP |
| `/kidotoy` | Administración de Kidotoy | Correo + contraseña |
| `/empresa` | Recursos Humanos del Acueducto | Correo + contraseña |
| `/entrega` | Operario en la jornada de entrega | Correo + contraseña |
| `/dev` | Solo Sebastián | Correo + contraseña, rol `admin_dev` |

`/dev` no se enlaza desde ninguna parte de la interfaz. No aparece en menús, ni en
navegación, ni en el pie de página. Se llega solo escribiendo la URL.

### `/acceso` — Colaborador
Lo más importante del producto. La mayoría entra desde el celular, muchos sin ser gente
técnica, y con un código que les llegó por correo interno. Si dudan si guardaron o no,
eso se convierte en llamadas a Recursos Humanos.

Flujo: ingresar → ver sus hijos con el estado de cada uno → entrar al catálogo de un hijo
→ ver 6 opciones → elegir → pantalla de confirmación con advertencia clara → confirmar →
ver código de entrega.

### `/kidotoy` — Administración
Selecciones en vivo, estado del inventario por edad y género, avance de la campaña,
quiénes faltan, liberar una selección puntual, exportar CSV, y gestión del catálogo.

### `/empresa` — Acueducto
Solo consulta. Avance de selección, cuántos faltan, alertas de referencias agotándose,
exportar reportes. **No puede editar inventario ni liberar selecciones.**

### `/entrega` — Operario
Pensado para usarse de pie, con una mano, en una carpa al aire libre. Botones grandes,
contraste alto, mínimo texto. Buscar por código o cédula, ver el juguete asignado,
marcar entregado.

---

## Las cinco reglas de negocio que no se pueden romper

1. **Un juguete por beneficiario.** Restricción `unique` sobre `beneficiario_id` en
   `selecciones`, no solo validación en la aplicación.

2. **El catálogo se filtra por edad exacta y género.** No por rangos. Un niño de 7 años
   ve exactamente las 6 referencias de `edad = 7` y `genero = 'Niño'`. Nunca ve nada de
   otra edad ni de otro género, aunque su grupo se quede sin stock.

3. **La confirmación es irreversible para el colaborador.** Solo un administrador de
   Kidotoy puede liberar una selección, y esa liberación queda en `auditoria`.

4. **El descuento de inventario es atómico.** Siempre a través de `confirmar_seleccion()`.

5. **El aislamiento entre empresas vive en la base de datos.** Toda tabla lleva
   `empresa_id` y tiene RLS activo, aunque hoy solo exista una empresa.

---

## Concurrencia de inventario (lo más delicado del proyecto)

En producción cerca de mil personas seleccionan en la misma ventana, con picos cuando
Recursos Humanos manda el comunicado. El riesgo real es que dos colaboradores confirmen
la última unidad de la misma referencia en el mismo instante.

Se resuelve con un único `UPDATE ... WHERE stock_disponible > 0` dentro de
`confirmar_seleccion()`. Postgres serializa las escrituras sobre la misma fila, así que
el segundo intento no encuentra fila y recibe `SIN_STOCK`.

**Nunca hacer esto:**

```ts
// INCORRECTO — condición de carrera garantizada
const { data } = await supabase.from('productos').select('stock_disponible').eq('id', id).single()
if (data.stock_disponible > 0) {
  await supabase.from('productos').update({ stock_disponible: data.stock_disponible - 1 }).eq('id', id)
}
```

**Siempre esto:**

```ts
const { data, error } = await supabase.rpc('confirmar_seleccion', {
  p_beneficiario_id: beneficiarioId,
  p_producto_id: productoId,
})
```

**Realtime es solo cosmético.** Sirve para que la disponibilidad se vea actualizada en
pantalla. Nunca es fuente de verdad para decidir si hay stock: la verdad la dicta el
retorno de `confirmar_seleccion()`.

> **No quitar `supabase.realtime.setAuth(session.access_token)` del catálogo.** El socket de
> Realtime del navegador conecta como anónimo por defecto; sin ese `setAuth` antes de
> `subscribe()`, RLS bloquea todos los eventos y el catálogo deja de actualizarse en vivo
> **sin ningún error visible**. No lo cachan typecheck, build ni las pruebas por API: solo
> se ve en navegador real con sesión. Parece una línea redundante y no lo es.

---

## Autenticación

El Acueducto definió acceso con **cédula + código SAP** para los colaboradores.

Enfoque: Supabase Auth con correo sintético. Al importar colaboradores se crea un usuario
con `email = "{cedula}@acueducto.interno"` y `password = codigo_sap`, y se guardan
`empresa_id` y `rol` en `app_metadata`. Así hay JWT real y RLS funcionando sin construir
manejo de sesión propio.

**La cédula no es un dato secreto.** Es semipública y adivinable; el único elemento
reservado del par es el código SAP. Por eso `intentos_acceso` y el bloqueo temporal por
documento no son opcionales, ni siquiera en el piloto.

Roles: `colaborador`, `admin_kidotoy`, `empresa_cliente`, `operario_entrega`, `admin_dev`.

---

## Cálculo de la edad

La edad determina qué 6 opciones ve el beneficiario. Como la selección ocurre en un momento
y la entrega en otro, la edad se calcula **siempre contra `empresas.fecha_corte`**, nunca
contra `now()`. Un niño que cumple años a mitad de campaña cambiaría de grupo y de juguete
asignado.

> **La carpa ya NO es la edad.** El juguete físico está en una carpa, no en una edad. Las
> carpas son configurables desde `/kidotoy` (tablas `carpas` y `carpa_referencias`): la
> asignación es **por referencia**, para poder juntar dos edades en un punto o partir una
> edad numerosa en dos. Cada cuenta de operario tiene una carpa (`operarios.carpa_id`). Al
> escanear, si el juguete es de otra carpa se avisa pero **no se bloquea** la entrega; queda
> `entregas.fuera_de_carpa = true`. El seed migra 14 carpas (una por edad 0–13) como valor
> por defecto. Ver `docs/03-guia-de-pantallas.md`.

Se guarda materializada en `beneficiarios.edad` y se recalcula con `recalcular_edades()`.

---

## Restricciones del plan gratuito de Supabase

Para el piloto alcanza de sobra, pero hay que tenerlas presentes:

- 500 MB de base de datos, 200 conexiones concurrentes de Realtime
- Sin respaldos automáticos
- **El proyecto se pausa tras 7 días sin actividad**

Ese último punto es un riesgo real: el piloto va a estar 20 días esperando a que el
Acueducto lo abra. Si nadie lo toca una semana, se pausa y la demostración se cae justo
cuando importa. **Implementar un endpoint `/api/keepalive` que haga una consulta trivial,
y llamarlo con un cron externo cada 24 horas.**

En producción esto exige plan Pro. La concurrencia de Realtime con 500 colaboradores
entrando el mismo día no cabe en el plan gratuito.

---

## Correo (Resend)

- Confirmación al colaborador cuando termina de seleccionar para todos sus hijos, con el
  código de entrega de cada uno.
- Resumen diario a Kidotoy: avance, referencias por agotarse, colaboradores pendientes.

El plan gratuito de Resend permite unos 3.000 correos al mes y 100 al día. Suficiente para
el piloto, insuficiente para el día pico en producción.

El envío va en una ruta de servidor o Edge Function, nunca desde el cliente. El resumen
diario se dispara con `pg_cron` o con un cron externo apuntando a una ruta protegida por
un secreto.

Durante el piloto se puede usar el remitente de pruebas de Resend; para producción hay que
verificar el dominio.

---

## Sistema de diseño y panel de temas

Todo el estilo vive en variables CSS, siguiendo la convención de shadcn/ui. Ningún color,
fuente ni espaciado se escribe directamente en un componente.

`/dev/tema` es un panel donde Sebastián ajusta en vivo colores, tipografías, radios,
espaciados y logos, con vista previa y guardado en la tabla `tema`. Los valores se
inyectan como variables CSS en el layout raíz.

Detalle completo en `docs/02-sistema-de-diseno.md`. **Léelo antes de escribir cualquier
componente**, porque define qué tokens existen y cómo se consumen.

---

## Alcance del piloto

**Sí entra:** los cuatro espacios con su login, flujo completo de selección, disponibilidad
en vivo, bloqueo tras confirmar, panel de administración con exportación y liberación,
consulta para el Acueducto, módulo de entrega en línea, correo de confirmación y resumen
diario, panel de temas, banner de versión de demostración.

**No entra:** modo sin conexión del módulo de entrega, jornada de rezagados, subdominios
por empresa, importadores de Excel (los datos van por seed), reportes avanzados.

---

## Datos

Todos los datos del piloto son **ficticios**. No se carga información real de colaboradores
ni de menores del Acueducto: no hay contrato firmado ni política de tratamiento definida, y
no hay razón para mover datos de menores a un ambiente de demostración.

El catálogo cubre las edades **3, 7 y 12** en ambos géneros: 36 referencias. Se eligieron
edades separadas para que se note que el catálogo cambia de verdad según la edad.

**Caso a preservar en las pruebas:** el colaborador con cédula `52318904` tiene tres hijos
de 3, 7 y 12 años. Es el mejor caso de demostración porque muestra tres catálogos distintos
bajo un mismo inicio de sesión. No lo borres del seed.

---

## Criterios de calidad

Antes de dar por terminada cualquier pantalla:

- Funciona bien en pantalla de celular.
- Los estados vacíos, de carga y de error están resueltos y dicen algo útil.
- Los errores de `confirmar_seleccion()` tienen mensaje en español claro, no un volcado
  técnico.
- Si dos pestañas seleccionan la última unidad, la segunda recibe un mensaje comprensible
  y la pantalla se corrige sola.
- Ningún color ni tamaño está escrito a mano: todo sale de las variables del tema.

---

## Convenciones

- Tablas, columnas y funciones de base de datos en español, snake_case.
- Código de aplicación en inglés, salvo términos de dominio: `colaborador`, `beneficiario`,
  `seleccion`, `entrega`.
- Toda mutación relevante deja registro en `auditoria`.
- Nunca exponer la clave de servicio de Supabase al cliente.
