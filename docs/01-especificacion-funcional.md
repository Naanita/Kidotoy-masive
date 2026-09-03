# Especificación funcional

## 1. Actores

| Actor | Espacio | Puede |
|---|---|---|
| Colaborador | `/acceso` | Ver sus hijos, elegir un juguete por hijo, confirmar |
| Admin Kidotoy | `/kidotoy` | Todo sobre catálogo, inventario, selecciones y entregas |
| Empresa cliente | `/empresa` | Solo consultar avance y exportar |
| Operario | `/entrega` | Buscar y marcar entregas |
| Admin dev | `/dev` | Panel de temas y parámetros del sistema |

---

## 2. Flujo del colaborador

### 2.1 Ingreso
Formulario con dos campos: número de cédula y código SAP. Sin registro, sin recuperación
de contraseña, sin correo.

Tras 5 intentos fallidos sobre la misma cédula, bloqueo de 15 minutos. El mensaje debe ser
genérico ("los datos no coinciden"), sin revelar si la cédula existe.

### 2.2 Mis beneficiarios
Lista de los hijos asociados. Cada tarjeta muestra nombre, edad a la fecha de corte, y un
estado claramente diferenciado:

- **Pendiente** → botón "Elegir regalo"
- **Confirmado** → nombre del juguete elegido y el código de entrega, sin botón de edición

Si todos están confirmados, un mensaje de cierre indicando que el proceso terminó.

### 2.3 Catálogo
Exactamente las 6 referencias de la edad y género del beneficiario. Cada tarjeta con
imagen, nombre, descripción y disponibilidad.

Las referencias agotadas se muestran deshabilitadas con la etiqueta "Agotado", no se
ocultan: si desaparecieran, el colaborador creería que la pantalla falló.

Suscripción a Realtime sobre `productos` filtrando por edad y género, para que la
disponibilidad se actualice sin recargar.

### 2.4 Confirmación
Pantalla intermedia obligatoria. Debe decir con todas sus letras que la selección **no se
puede modificar después**. Dos botones: volver y confirmar.

Al confirmar se llama `confirmar_seleccion()`. Manejo de errores:

| Error | Mensaje al usuario |
|---|---|
| `SIN_STOCK` | "Este juguete se agotó mientras lo elegías. Por favor selecciona otro." + volver al catálogo ya actualizado |
| `YA_TIENE_SELECCION` | "Este beneficiario ya tiene un regalo confirmado." + ir a la lista |
| Otro | Mensaje genérico y opción de reintentar |

### 2.5 Comprobante
Nombre del beneficiario, juguete, código de entrega y código QR. Aviso de que debe
presentarlo el día del evento.

Cuando todos los hijos quedan confirmados, se envía el correo de confirmación si el
colaborador tiene correo registrado.

---

## 3. Panel de Kidotoy

- **Resumen:** total de beneficiarios, confirmados, pendientes, porcentaje de avance,
  referencias agotadas, referencias por debajo del 20% de stock.
- **Selecciones:** tabla filtrable por edad, género, área y estado. Exportable a CSV.
- **Inventario:** tabla por edad y género con referencias, stock inicial, disponible y
  consumido. Edición de stock con registro en auditoría.
- **Liberar selección:** buscar beneficiario, ver su selección, liberar con motivo
  obligatorio. Devuelve la unidad al inventario y registra en auditoría.
- **Catálogo:** alta y edición de referencias.
- **Entregas:** avance de la jornada, pendientes por carpa, exportación.

---

## 4. Portal del Acueducto

Solo lectura. Mismo resumen de avance, listado de colaboradores pendientes (nombre, área,
cuántos hijos le faltan) y exportación. Sin acceso a inventario, costos ni liberación.

---

## 5. Módulo de entrega

Interfaz para usar de pie, con una mano, al aire libre.

1. Buscar por código de entrega, escaneo de QR o cédula del colaborador.
2. Resultado: nombre del beneficiario, edad, carpa, juguete asignado, foto y estado.
3. Botón grande "Marcar entregado". Confirmación visual inequívoca.
4. Si ya estaba entregado, aviso claro con fecha, hora y operario anterior.

Contador de entregas de la jornada siempre visible.

En el piloto el módulo funciona en línea. El modo sin conexión completo pertenece a la
fase de producción, pero **el modelo de datos ya lo contempla**: `entregas` tiene
`sincronizado_at` para permitir cola local sin migración posterior.

---

## 6. Panel `/dev`

Ruta oculta, no enlazada, con rol `admin_dev`.

- **Tema:** ver `docs/02-sistema-de-diseno.md`
- **Parámetros:** fecha de corte, ventana de selección, activar o desactivar el banner de
  demostración.
- **Auditoría:** consulta del registro completo.
- **Herramientas:** recalcular edades, reenviar el resumen diario, verificar keepalive.

---

## 7. Correos

**Confirmación al colaborador.** Se dispara cuando todos sus beneficiarios quedan
confirmados. Contiene, por cada hijo, el juguete y el código de entrega, más la fecha y
lugar del evento.

**Resumen diario a Kidotoy.** Una vez al día: avance, confirmados del día, referencias
agotadas o por agotarse, colaboradores pendientes.

Ambos con plantilla HTML sobria, sin imágenes pesadas, legible en cliente de correo.

---

## 8. Fuera de alcance del piloto

Modo sin conexión completo, jornada de rezagados, subdominios por empresa, importadores de
Excel, integración con SAP, pasarela de pagos, aplicación nativa, gestión de terceros
autorizados para reclamar.
