# Guía de pantallas — para rediseñar la plataforma

Este documento describe, en lenguaje de producto, todo lo que hay que saber para rehacer el
diseño visual de la plataforma sin haber visto el código. Explica qué hace cada pantalla,
qué información muestra, qué acciones ofrece, a dónde lleva y en qué estados puede aparecer.

---

## 1. Qué es el proyecto

Es una plataforma web para regalos corporativos de fin de año. Una empresa grande le regala
un juguete a cada hijo de sus colaboradores. Los colaboradores entran desde su celular,
ven a sus hijos, y para cada uno eligen un juguete de un catálogo limitado que corresponde
a su edad y su género. El inventario es finito y se agota en vivo, así que dos personas no
pueden llevarse la última unidad del mismo juguete. Cuando el colaborador confirma, recibe
un comprobante con un código. El día del evento, en un parque, hay varias carpas de entrega;
el personal de la juguetería busca el código, ve qué juguete corresponde y en qué carpa está,
y lo entrega. La plataforma también le da a la juguetería y a la empresa un tablero para
seguir el avance en tiempo real.

---

## 2. Los cuatro tipos de usuario

**El colaborador (celular).** Es un empleado de la empresa, muchas veces no técnico, que
recibió por correo interno su documento y un código. Entra desde el celular, a veces con
una sola mano, a veces con prisa. Su miedo es "¿quedó guardado o no?". Necesita elegir el
regalo de cada hijo con la menor cantidad de pasos posible y quedar seguro de que terminó.
Es el usuario más importante y el que menos tolera fricción. Diseño: generoso, un objetivo
por pantalla, botones grandes, texto claro.

**La administración de la juguetería (escritorio).** Vigila la campaña completa: cuánto
avanza, qué se agota, quién falta, y opera la logística (inventario, catálogo, carpas,
personal de entrega, corrección de errores). Trabaja en computador, quiere ver mucha
información a la vez. Diseño: denso, orientado a tablas, compacto. Es lo contrario del
colaborador.

**Recursos Humanos de la empresa cliente (escritorio).** Solo mira. Necesita saber cómo va
la campaña y descargar reportes para su gestión interna. No puede cambiar nada. Diseño:
intermedio, orientado a lectura y a exportar.

**El operario de entrega (celular, de pie, al aire libre).** El día del evento, en una
carpa al sol, con una mano, atendiendo una fila. Necesita, en segundos: buscar un código,
ver qué entregar y confirmarlo, y pasar al siguiente. Es la pantalla más simple y más
rápida de todo el sistema. Diseño: botones enormes, contraste máximo, poquísimo texto.

---

## 3. Pantallas del colaborador

### 3.1 Ingreso
Un formulario corto: número de documento y un código. Sin registro, sin recuperación de
contraseña, sin correo. Si los datos no coinciden, un mensaje genérico ("los datos no
coinciden"). Ese mensaje es **siempre el mismo**, incluso si la persona se equivoca muchas
veces seguidas y el sistema la bloquea temporalmente: nunca se le dice que existe un bloqueo
ni cuánto falta (por seguridad). Botón para entrar.

### 3.2 Mis beneficiarios
Lista de los hijos asociados a esa persona. Cada hijo es una tarjeta con su nombre y su edad.
Cada tarjeta está en uno de dos estados:
- **Pendiente**: muestra un botón "Elegir regalo".
- **Confirmado**: muestra el juguete elegido y su código de entrega, y un acceso a ver el
  comprobante. Ya no se puede cambiar.

Si todos los hijos están confirmados, aparece un mensaje de cierre indicando que el proceso
terminó. Si la persona no tiene hijos asociados, un estado vacío que lo explica y sugiere
contactar a Recursos Humanos.

Lleva a: el catálogo de un hijo (al tocar "Elegir regalo") o su comprobante.

### 3.3 Catálogo de un hijo
Muestra exactamente seis juguetes: los que corresponden a la edad y el género de ese hijo.
Nunca muestra juguetes de otra edad ni de otro género, aunque su grupo se quede sin nada.
Cada juguete es una tarjeta con imagen, nombre, descripción y disponibilidad.
- Un juguete disponible tiene un botón para elegirlo.
- Un juguete **agotado** se muestra igual pero **deshabilitado y con una etiqueta "Agotado"**.
  No se oculta: si desapareciera, la persona pensaría que la pantalla falló.
- Un juguete con pocas unidades puede mostrar una señal de "últimas unidades".

La disponibilidad se actualiza **sola, sin recargar**: si alguien más toma la última unidad
mientras esta persona mira, el juguete pasa a "Agotado" en la pantalla en vivo.

Si el periodo de selección todavía no abre o ya cerró, el catálogo **se ve igual** (la
persona puede mirar), pero no se puede confirmar; hay un aviso de desde/hasta cuándo.

Lleva a: la pantalla de confirmación de un juguete.

### 3.4 Confirmación
Pantalla intermedia obligatoria. Muestra el juguete elegido y el nombre del hijo, y una
**advertencia clara de que la elección no se puede cambiar** después. Dos caminos: volver
o confirmar. Si el periodo no está abierto, el botón de confirmar aparece deshabilitado con
el aviso de cuándo se habilita.

Al confirmar pueden pasar tres cosas:
- **Éxito**: pasa al comprobante.
- **Se agotó mientras elegía**: mensaje "este juguete se agotó mientras lo elegías, elige
  otro" y un camino de vuelta al catálogo (ya actualizado). La pantalla se corrige sola.
- **Ese hijo ya tenía un regalo**: mensaje que lo explica y lleva a la lista.

### 3.5 Comprobante
Confirmación final para un hijo. Muestra el nombre del hijo, el juguete, el **código de
entrega** grande y legible, y un **código QR** del mismo código. Muestra la fecha y el lugar
del evento, y el aviso de presentarlo el día de la entrega. Cuando la persona termina con
todos sus hijos, además recibe un correo con los códigos (ese correo tiene que servir
impreso en blanco y negro).

---

## 4. Pantallas de la administración (juguetería)

Todas comparten un encabezado con el nombre de la marca y una navegación entre secciones.
Es un espacio denso, de escritorio.

### 4.1 Ingreso
Correo y contraseña, y un botón de entrar. Formulario centrado y sobrio, de escritorio. Si
las credenciales no coinciden, un **mensaje genérico** ("los datos no coinciden") que no
dice si falló el correo o la clave.

Este es el patrón de ingreso que **comparten los cuatro espacios de personal** —
administración, empresa, operario y el espacio interno—: los mismos dos campos y el mismo
mensaje de error. Frente al ingreso del colaborador (3.1) hay dos diferencias: aquí se entra
con **correo y contraseña** (no documento y código), y **no existe el bloqueo silencioso por
intentos** (ese es exclusivo del colaborador, cuyo documento es semipúblico). Entre los
cuatro ingresos del personal las diferencias son solo de contexto visual, no de
comportamiento:
- **Administración** y **empresa**: formulario de escritorio, sobrio.
- **Operario**: los mismos campos, pero con la estética grande y de alto contraste de su
  espacio, para el celular al aire libre (ver sección 6).
- **Espacio interno (dev)**: idéntico, pero la pantalla es **oculta**: no está enlazada en
  ninguna parte y solo se llega escribiendo la URL.

### 4.2 Resumen
Responde de un vistazo las tres preguntas del día: **cuánto falta** (porcentaje de avance,
confirmados, pendientes, barra de progreso), **qué se está agotando** (cuántas referencias
agotadas y cuántas por agotarse) y **quiénes no han entrado** (lista de colaboradores con
hijos sin elegir). Si algo no ayuda a responder una de esas tres, sobra.

### 4.3 Selecciones
Una tabla con todos los beneficiarios y su estado. Se filtra por edad, género, área y estado
(confirmado o pendiente) y por búsqueda de texto. Se exporta a un archivo para abrir en
Excel. Cada fila muestra el beneficiario, edad, género, colaborador, área, juguete, código y
estado.

### 4.4 Inventario
Dos partes: un resumen por edad y género (cuántas referencias, unidades iniciales,
disponibles y consumidas) y una tabla de referencias donde se puede **editar el total de
unidades** de cada una. La regla: nunca se puede fijar un total menor que lo ya consumido, y
el sistema lo impide con un mensaje claro. Cada referencia muestra su estado de stock
(disponible, por agotarse, agotado, inactivo).

### 4.5 Entregas (gestión de la jornada)
El tablero de la jornada de entrega. Muestra el avance total y el **avance por carpa** (cada
carpa con cuántas entregó de cuántas le tocan, y cuántas le faltan, para saber dónde mandar
refuerzo). Muestra las últimas entregas registradas (con el operario y la hora), un contador
de entregas "fuera de carpa", y un buscador para revisar el estado de entrega de un
beneficiario. Desde aquí un administrador puede **revertir una entrega marcada por error**,
con un motivo obligatorio que queda registrado. Se exporta el consolidado.

### 4.6 Carpas y referencias
Aquí se definen los **puntos físicos de entrega** del evento. La carpa **no es la edad**: la
juguetería puede juntar dos edades en un punto, o partir una edad numerosa en dos. La
pantalla tiene:
- La lista de carpas: crear una nueva, renombrarlas, eliminarlas. Cada una muestra cuántas
  referencias despacha.
- Una tabla de referencias donde a cada juguete se le asigna **una** carpa (dónde está
  físicamente).
- Una **alerta destacada** si alguna referencia quedó sin carpa: ese es un juguete que nadie
  podría entregar, así que hay que resolverlo.

### 4.7 Operarios
Las cuentas del personal de entrega. El día del evento son muchas personas trabajando al
tiempo, y cada una necesita su propia cuenta para que el registro de quién entregó qué sea
confiable. Aquí se **crean cuentas de operario** (nombre, correo, contraseña y carpa) y se
**cambia la carpa** de cada uno. Una tabla con la lista.

### 4.8 Liberar selección
Buscar la selección confirmada de un beneficiario y **liberarla** (devolverla a "sin
elegir", devolviendo la unidad al inventario). Exige un motivo (mínimo unas palabras
reales), y avisa que queda registrado a nombre de quien lo hace. Es irreversible para el
colaborador.

### 4.9 Catálogo
Alta y edición de referencias: nombre, descripción, imagen, activar o desactivar, y crear
nuevas. El stock se edita en Inventario, no aquí.

---

## 5. Pantallas de la empresa cliente (Acueducto)

Espacio de solo lectura, intermedio en densidad. **No tiene ningún control de acción**: si
algo no se puede hacer desde aquí, no aparece (ni siquiera apagado).

### 5.1 Ingreso
Correo y contraseña, con el mismo comportamiento del ingreso descrito en 4.1 (mensaje
genérico ante credenciales malas, sin bloqueo por intentos). Formulario de escritorio,
sobrio.

### 5.2 Avance
El mismo resumen de avance (porcentaje, confirmados, pendientes), una alerta si hay
referencias agotándose (solo el conteo, sin detalle de inventario ni nada de negocio), y la
lista de colaboradores pendientes (nombre, área, cuántos hijos le faltan).

### 5.3 Selecciones
La misma tabla filtrable de selecciones, con exportación a Excel. Sin acciones.

---

## 6. Pantallas del operario de entrega

La pantalla más simple del sistema. En su encabezado, **siempre visible**, dice en qué carpa
está trabajando ese operario y un contador de cuántas entregas lleva la jornada.

### 6.1 Ingreso
Correo y contraseña, con el mismo comportamiento del ingreso de 4.1, pero con la estética del
módulo de entrega: campos y botón grandes, alto contraste, pensado para usarse de pie con el
celular al aire libre.

### 6.2 Buscar
Un campo grande para escribir el código o el documento, un botón grande de buscar, y un
botón grande de "Escanear QR" (abre la cámara). Si no encuentra nada, lo dice.

### 6.3 Ficha del beneficiario
Muestra en grande el nombre del beneficiario, su edad, el juguete con su imagen, y — de forma
**destacada** — la carpa a la que corresponde el juguete. Aquí hay tres situaciones según la
carpa:
- **Es la carpa del operario**: se muestra en verde, como "correcto, es aquí".
- **Es otra carpa**: se muestra un aviso grande indicando a qué carpa debe ir la familia. Pero
  **no se bloquea la entrega**: si la familia ya está ahí y el operario tiene el juguete a
  mano, puede entregarlo igual (mandarlos a otra fila por una regla del sistema es peor que la
  regla). Esa entrega queda marcada como "fuera de carpa" para que el conteo por punto cuadre.
- **Sin carpa asignada**: un aviso de que ese juguete no tiene carpa y hay que avisar a
  administración; igual se puede entregar.

Un botón enorme de "Marcar entregado". Si el regalo **ya había sido entregado**, en vez del
botón aparece un aviso de que ya se entregó, con la fecha, la hora y el operario anterior.

### 6.4 Confirmación de entrega (pantalla completa)
Al marcar entregado, toda la pantalla se vuelve verde con un gran visto, el nombre del
beneficiario enorme, el juguete y la carpa. Tiene que ser inequívoco a un metro de distancia.
Si fue una entrega fuera de carpa, lo indica. Un solo botón grande de "Siguiente" reinicia
para atender al próximo, sin buscar un botón pequeño.

### 6.5 Ya entregado (pantalla completa)
Si se intenta entregar algo ya entregado, toda la pantalla se vuelve roja, con el aviso, la
fecha, la hora y el operario anterior. Igual de imposible de pasar por alto: es el caso que
genera discusiones en la carpa. Un botón grande de "Entendido, siguiente".

---

## 7. Espacio de configuración (oculto) — fuera del rediseño

Hay un espacio interno y oculto (solo se llega escribiendo la URL, no aparece enlazado en
ninguna parte) donde se ajusta la apariencia de toda la plataforma: el **panel de temas**.
Su ingreso es el mismo de correo y contraseña descrito en 4.1.

**Este panel está fuera del alcance del rediseño: no hay que dibujarlo.** Es un instrumento
interno que usa solo el dueño del proyecto para producir y guardar la paleta, las fuentes y
las formas del producto; no es una superficie que vea ningún usuario final, ni el
colaborador, ni la juguetería, ni la empresa, ni el operario. Aunque es la pantalla más
compleja del sistema (controles a un lado, vista previa en vivo al otro), su aspecto no
importa para el producto, y afinarlo no aporta valor al cliente. **El diseñador no debe
invertir tiempo en esta pantalla.**

Lo que el diseñador **sí** necesita de aquí no es la pantalla, sino su resultado: los
**tokens de diseño** que este panel controla. Son el vocabulario con el que se define una
identidad visual nueva y se aplica de forma consistente a todo el producto. Eso está en la
sección 10.

---

## 8. Los estados que cambian la apariencia

Estos son los estados que un rediseño debe representar con claridad. Muchos no se pueden
comunicar solo con color (una persona puede usar el sistema al sol o tener daltonismo): cada
estado lleva además un texto o un ícono.

- **Pendiente**: un beneficiario que aún no tiene regalo elegido. En listas y tablas.
- **Confirmado**: un beneficiario que ya eligió. Muestra el juguete y su código. Es
  definitivo para el colaborador.
- **Agotado**: un juguete sin unidades. Se muestra deshabilitado y con etiqueta, nunca oculto.
- **Por agotarse / últimas unidades**: un juguete con muy poco stock. Señal de advertencia.
- **Entregado**: un regalo que ya se entregó físicamente en el evento.
- **Ya entregado (al reintentar)**: cuando alguien intenta entregar algo que ya se entregó.
  Es un aviso fuerte, con fecha, hora y operario anterior.
- **Fuera de ventana**: cuando el periodo de selección no está abierto (aún no abre o ya
  cerró). El catálogo se ve, pero no se puede confirmar; hay un aviso de fechas.
- **Fuera de carpa**: una entrega hecha en una carpa distinta a la que le corresponde al
  juguete. No es un error que bloquee, pero queda marcado.
- **Bloqueado (acceso)**: cuando alguien falla demasiadas veces el ingreso. Importante: al
  colaborador **no se le muestra** que está bloqueado; ve el mismo mensaje genérico de
  siempre. El estado existe por seguridad, pero es invisible para el usuario.
- **Estados vacíos, de carga y de error**: cada pantalla debe resolverlos y decir algo útil
  (sin beneficiarios, cargando, algo salió mal).

---

## 9. Qué es innegociable y qué es libre

**Innegociable (por producto, no rediseñar):**
- El colaborador ve **exactamente seis juguetes**, de su edad y género exactos. Nunca de otro
  grupo.
- Los juguetes agotados **se muestran deshabilitados con etiqueta**, no se ocultan.
- La confirmación del colaborador es un paso aparte, con **advertencia explícita de que es
  definitiva**.
- El comprobante muestra el **código de entrega y su QR**, legibles.
- El mensaje de error de ingreso es **siempre el mismo**, incluso durante un bloqueo.
- El operario ve **siempre** en qué carpa trabaja, y la carpa del juguete es **destacada**.
- Una entrega en otra carpa **nunca se bloquea**.
- La pantalla de "entregado" y la de "ya entregado" son **a pantalla completa e inequívocas
  a un metro**, y el paso al siguiente es **un solo toque grande**.
- Ningún estado se comunica **solo con color**: siempre hay texto o ícono.
- La densidad correcta por espacio: colaborador y operario generosos y grandes; juguetería
  densa; empresa intermedia.

**Libre (rediseñar a gusto):**
- Toda la estética: colores, tipografías, formas, sombras, ilustración, íconos, fotografía.
- La composición y el layout de cada pantalla, mientras conserve la información y las
  acciones descritas.
- Micro-interacciones, animaciones, transiciones.
- El tono visual de la marca.

---

## 10. Tokens de diseño y cómo se cambian

Toda la apariencia de la plataforma se controla con un conjunto de **tokens** (variables de
diseño). No hay colores ni tamaños "sueltos" en ninguna pantalla: todo sale de estos tokens,
así que cambiar un token cambia el sistema entero de forma coherente. Hay un panel interno
(el panel de temas) con vista previa en vivo, donde se ajustan y se guardan. Los tokens
disponibles:

**Color** — un par de fondo/texto para cada rol de color:
- Fondo y texto base de la aplicación.
- Superficies elevadas (tarjetas) y menús.
- Color principal / de marca (y su texto encima).
- Color secundario, de apoyo (muted) y de resaltado (accent).
- Estados: error/destructivo, éxito (confirmado, entregado), advertencia (stock bajo).
- Bordes, campos y anillo de foco.

**Tipografía:**
- Fuente de títulos y fuente de cuerpo (de una lista curada).
- Tamaño base del texto y la escala (qué tanto crecen los tamaños grandes respecto al base).
- Peso de los títulos.

**Forma y espacio:**
- Radio de las esquinas.
- Unidad de espaciado y densidad (compacta / normal / amplia).
- Nivel de sombra (ninguna / sutil / media).

**Marca:**
- Nombre de la marca que se muestra en los encabezados.
- Logo (y una variante para modo oscuro) y favicon.

**Cómo se cambian:** en el panel de temas, con selectores de color (con campo hexadecimal),
un botón que deriva variantes a partir del color principal, menús de fuente, deslizadores de
tamaño/escala/radio/espaciado, y selectores de densidad y sombra. La vista previa muestra
componentes reales del producto (una tarjeta de juguete, una tarjeta de beneficiario
confirmado, una alerta de error, una fila de tabla, un encabezado con logo, un botón
principal) para ver el cambio de verdad, y permite alternar claro y oscuro. Los cambios se
ven en vivo, pero **nada se aplica hasta guardar**. Hay una verificación de contraste que
avisa (sin bloquear) cuando una combinación de colores es difícil de leer — importante
porque hay gente usando esto en un celular al sol.

Para un rediseño: definir una nueva paleta y tipografía en estos términos permite que todo
el producto la adopte de forma consistente sin tocar pantalla por pantalla.
