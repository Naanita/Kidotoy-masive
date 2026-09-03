# Plataforma de selección de regalos — Estado del piloto

Herramienta web donde los colaboradores de una empresa eligen, desde su celular, el regalo
de fin de año de cada uno de sus hijos, con inventario limitado y disponibilidad en vivo, y
donde después se controla la entrega física de cada obsequio el día del evento.

## Qué quedó funcionando

La plataforma tiene cuatro espacios, cada uno con su propio ingreso:

- **Para el colaborador (celular).** Ingresa con su cédula y un código que le llega por
  correo. Ve a sus hijos, y para cada uno entra a un catálogo de 6 juguetes que corresponde
  exactamente a su edad y género. Elige, confirma en una pantalla que le advierte que la
  decisión es definitiva, y recibe un comprobante con un código y un código QR para
  presentar el día de la entrega. Cuando termina con todos sus hijos, le llega un correo de
  confirmación con los códigos (sirve incluso impreso en blanco y negro).

- **Para la administración de Kidotoy.** Un tablero con el avance de la campaña en tiempo
  real: cuánto falta, qué referencias se están agotando y quiénes aún no han entrado. Puede
  revisar y exportar las selecciones a Excel, ajustar el inventario, gestionar el catálogo,
  liberar una selección puntual (queda registrado quién y por qué), y llevar el control de
  la jornada de entrega por carpa. Cada día recibe un correo con el resumen.

- **Para Recursos Humanos del Acueducto.** Solo consulta: ve el avance, quiénes están
  pendientes y puede exportar reportes. No puede modificar nada.

- **Para el operario de entrega (celular, al aire libre).** Pantalla simple y de botones
  grandes: busca por código, por cédula o escaneando el QR, ve a qué carpa va el niño y
  qué juguete le corresponde, y confirma la entrega con un solo toque. Si un regalo ya fue
  entregado, lo avisa de forma imposible de pasar por alto, con la hora y el operario.

## Lo que hace la plataforma robusta

- **Nunca se entrega dos veces el mismo regalo ni se compromete un juguete que ya no está.**
  Si dos personas eligen la última unidad en el mismo instante, solo una la obtiene; a la
  otra se le avisa con claridad y la pantalla se corrige sola, sin que tenga que recargar.
  Esto se probó a propósito con dos personas eligiendo al tiempo.
- **La disponibilidad se actualiza sola en pantalla**, sin recargar.
- **Cada empresa ve solo lo suyo**, y la apariencia (colores, logo, tipografía) se puede
  ajustar sin tocar programación.

## Qué le pueden mostrar al Acueducto

El recorrido completo de un colaborador con tres hijos de edades distintas (3, 7 y 12
años), que muestra tres catálogos diferentes bajo un mismo ingreso — desde el login hasta
el comprobante de los tres. Hay un video grabado de este recorrido para presentarlo antes
de que el Acueducto entre. También se puede mostrar en vivo el tablero de administración
con datos de ejemplo (campaña a medio avance, entregas en curso, una referencia agotada).

## Importante para la demostración

Todo funciona con **datos ficticios**: no hay información real de colaboradores ni de
menores. Es un ambiente de demostración, no el sistema definitivo.

## Qué falta para producción (cuando se gane la licitación)

- Subir el plan de la base de datos y el del correo, para aguantar a los ~500 colaboradores
  entrando el mismo día y el volumen de correos de ese día.
- Un usuario propio para cada operario de entrega (el día del evento son varios a la vez),
  para que el registro de quién entregó qué sea confiable.
- Cargar los datos reales de los colaboradores y sus hijos, con el contrato y la política de
  manejo de datos firmados (hoy, por decisión, no se mueve información real de menores).
- Verificar el correo con el dominio propio de Kidotoy.
- Una revisión final en teléfonos reales de distintas marcas.

En resumen: el piloto está completo y listo para mostrar. Lo que queda son pasos de
puesta en marcha para el volumen real, no funcionalidades por construir.
