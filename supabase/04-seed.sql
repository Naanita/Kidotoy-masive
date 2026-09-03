-- =====================================================================
-- Seed del piloto. DATOS FICTICIOS.
-- No contiene información real de colaboradores ni de menores.
-- =====================================================================

delete from entregas; delete from selecciones; delete from carpa_referencias;
delete from operarios; delete from beneficiarios; delete from carpas;
delete from productos; delete from colaboradores; delete from tema; delete from empresas;

insert into empresas (id, slug, nombre, nit, fecha_corte, ventana_inicio, ventana_fin, evento_fecha, evento_lugar) values
  ('11111111-1111-4111-8111-111111111111', 'acueducto', 'Empresa de Acueducto y Alcantarillado de Bogotá', '899.999.094-1',
   '2026-12-12', '2026-09-01 08:00-05', '2026-12-10 23:59-05', '2026-12-12', 'Parque Jaime Duque');

insert into tema (empresa_id, tokens) values ('11111111-1111-4111-8111-111111111111', '{}'::jsonb);

insert into productos (empresa_id, codigo_referencia, sku, nombre, descripcion, edad, genero, stock_inicial, stock_disponible, imagen_url) values
  ('11111111-1111-4111-8111-111111111111','REF-03N1','BLQ-060','Set de bloques grandes 60 piezas','Piezas grandes, seguras para manos pequeñas',3,'Niño',12,12,'https://placehold.co/600x600/EEE/31343C?text=BLQ-060'),
  ('11111111-1111-4111-8111-111111111111','REF-03N2','CAR-MAD','Carro de arrastre de madera','Madera natural, pintura no tóxica',3,'Niño',12,12,'https://placehold.co/600x600/EEE/31343C?text=CAR-MAD'),
  ('11111111-1111-4111-8111-111111111111','REF-03N3','CUB-ENC','Cubo de encaje de figuras','6 figuras geométricas',3,'Niño',17,17,'https://placehold.co/600x600/EEE/31343C?text=CUB-ENC'),
  ('11111111-1111-4111-8111-111111111111','REF-03N4','TAM-INF','Tambor musical infantil','Con dos baquetas de goma',3,'Niño',14,14,'https://placehold.co/600x600/EEE/31343C?text=TAM-INF'),
  ('11111111-1111-4111-8111-111111111111','REF-03N5','RMP-012','Rompecabezas de madera 12 piezas','Motivo de animales de granja',3,'Niño',10,10,'https://placehold.co/600x600/EEE/31343C?text=RMP-012'),
  ('11111111-1111-4111-8111-111111111111','REF-03N6','HER-JUG','Set de herramientas de juguete','10 piezas con maletín',3,'Niño',16,16,'https://placehold.co/600x600/EEE/31343C?text=HER-JUG'),
  ('11111111-1111-4111-8111-111111111111','REF-03A1','BLQ-060','Set de bloques grandes 60 piezas','Piezas grandes, seguras para manos pequeñas',3,'Niña',16,16,'https://placehold.co/600x600/EEE/31343C?text=BLQ-060'),
  ('11111111-1111-4111-8111-111111111111','REF-03A2','MUN-TRP','Muñeca de trapo 35 cm','Suave, lavable a máquina',3,'Niña',10,10,'https://placehold.co/600x600/EEE/31343C?text=MUN-TRP'),
  ('11111111-1111-4111-8111-111111111111','REF-03A3','COC-CMP','Cocinita compacta con accesorios','8 accesorios incluidos',3,'Niña',13,13,'https://placehold.co/600x600/EEE/31343C?text=COC-CMP'),
  ('11111111-1111-4111-8111-111111111111','REF-03A4','XIL-INF','Xilófono infantil de colores','8 notas, con baqueta',3,'Niña',14,14,'https://placehold.co/600x600/EEE/31343C?text=XIL-INF'),
  ('11111111-1111-4111-8111-111111111111','REF-03A5','RMP-012','Rompecabezas de madera 12 piezas','Motivo de animales de granja',3,'Niña',12,12,'https://placehold.co/600x600/EEE/31343C?text=RMP-012'),
  ('11111111-1111-4111-8111-111111111111','REF-03A6','PEL-INT','Peluche interactivo con sonidos','Funciona con pilas incluidas',3,'Niña',8,8,'https://placehold.co/600x600/EEE/31343C?text=PEL-INT'),
  ('11111111-1111-4111-8111-111111111111','REF-07N1','CNS-250','Set de construcción 250 piezas','Compatible con bloques estándar',7,'Niño',8,8,'https://placehold.co/600x600/EEE/31343C?text=CNS-250'),
  ('11111111-1111-4111-8111-111111111111','REF-07N2','PST-RMP','Pista de carros con rampa','Incluye dos vehículos',7,'Niño',14,14,'https://placehold.co/600x600/EEE/31343C?text=PST-RMP'),
  ('11111111-1111-4111-8111-111111111111','REF-07N3','BAL-FUT','Balón de fútbol No. 4','Cosido a máquina, tamaño juvenil',7,'Niño',17,17,'https://placehold.co/600x600/EEE/31343C?text=BAL-FUT'),
  ('11111111-1111-4111-8111-111111111111','REF-07N4','JMS-EST','Juego de mesa de estrategia','De 2 a 4 jugadores, 30 min por partida',7,'Niño',13,13,'https://placehold.co/600x600/EEE/31343C?text=JMS-EST'),
  ('11111111-1111-4111-8111-111111111111','REF-07N5','KIT-CIE','Kit de ciencia con 20 experimentos','Manual ilustrado incluido',7,'Niño',14,14,'https://placehold.co/600x600/EEE/31343C?text=KIT-CIE'),
  ('11111111-1111-4111-8111-111111111111','REF-07N6','PAT-INI','Patineta de iniciación','Con protecciones básicas',7,'Niño',16,16,'https://placehold.co/600x600/EEE/31343C?text=PAT-INI'),
  ('11111111-1111-4111-8111-111111111111','REF-07A1','CNS-250','Set de construcción 250 piezas','Compatible con bloques estándar',7,'Niña',18,18,'https://placehold.co/600x600/EEE/31343C?text=CNS-250'),
  ('11111111-1111-4111-8111-111111111111','REF-07A2','ART-048','Set de arte 48 piezas','Marcadores, colores y block',7,'Niña',17,17,'https://placehold.co/600x600/EEE/31343C?text=ART-048'),
  ('11111111-1111-4111-8111-111111111111','REF-07A3','MUN-ART','Muñeca articulada con accesorios','30 cm, incluye ropa de cambio',7,'Niña',9,9,'https://placehold.co/600x600/EEE/31343C?text=MUN-ART'),
  ('11111111-1111-4111-8111-111111111111','REF-07A4','JMS-FAM','Juego de mesa familiar','De 2 a 6 jugadores',7,'Niña',18,18,'https://placehold.co/600x600/EEE/31343C?text=JMS-FAM'),
  ('11111111-1111-4111-8111-111111111111','REF-07A5','PUL-ABA','Kit de pulseras y abalorios','Más de 300 piezas',7,'Niña',14,14,'https://placehold.co/600x600/EEE/31343C?text=PUL-ABA'),
  ('11111111-1111-4111-8111-111111111111','REF-07A6','PTN-AJU','Patines ajustables','Talla regulable, con protecciones',7,'Niña',8,8,'https://placehold.co/600x600/EEE/31343C?text=PTN-AJU'),
  ('11111111-1111-4111-8111-111111111111','REF-12N1','AUD-BT1','Audífonos diadema Bluetooth','Plegables, 20 horas de batería',12,'Niño',13,13,'https://placehold.co/600x600/EEE/31343C?text=AUD-BT1'),
  ('11111111-1111-4111-8111-111111111111','REF-12N2','ROB-INI','Kit de robótica de iniciación','Arma 5 modelos distintos',12,'Niño',13,13,'https://placehold.co/600x600/EEE/31343C?text=ROB-INI'),
  ('11111111-1111-4111-8111-111111111111','REF-12N3','BAL-BAL','Balón de baloncesto No. 7','Superficie para exteriores',12,'Niño',8,8,'https://placehold.co/600x600/EEE/31343C?text=BAL-BAL'),
  ('11111111-1111-4111-8111-111111111111','REF-12N4','MOR-DEP','Morral deportivo 25 litros','Compartimento para portátil',12,'Niño',15,15,'https://placehold.co/600x600/EEE/31343C?text=MOR-DEP'),
  ('11111111-1111-4111-8111-111111111111','REF-12N5','REL-DEP','Reloj digital deportivo','Resistente al agua, cronómetro',12,'Niño',11,11,'https://placehold.co/600x600/EEE/31343C?text=REL-DEP'),
  ('11111111-1111-4111-8111-111111111111','REF-12N6','DIB-TEC','Set de dibujo técnico','Estuche con 12 instrumentos',12,'Niño',17,17,'https://placehold.co/600x600/EEE/31343C?text=DIB-TEC'),
  ('11111111-1111-4111-8111-111111111111','REF-12A1','AUD-BT1','Audífonos diadema Bluetooth','Plegables, 20 horas de batería',12,'Niña',9,9,'https://placehold.co/600x600/EEE/31343C?text=AUD-BT1'),
  ('11111111-1111-4111-8111-111111111111','REF-12A2','ROB-INI','Kit de robótica de iniciación','Arma 5 modelos distintos',12,'Niña',8,8,'https://placehold.co/600x600/EEE/31343C?text=ROB-INI'),
  ('11111111-1111-4111-8111-111111111111','REF-12A3','PAR-BT1','Parlante portátil Bluetooth','Resistente a salpicaduras',12,'Niña',17,17,'https://placehold.co/600x600/EEE/31343C?text=PAR-BT1'),
  ('11111111-1111-4111-8111-111111111111','REF-12A4','MOR-ESC','Morral escolar 22 litros','Compartimento acolchado',12,'Niña',9,9,'https://placehold.co/600x600/EEE/31343C?text=MOR-ESC'),
  ('11111111-1111-4111-8111-111111111111','REF-12A5','ART-CAL','Set de arte y caligrafía','Estuche con 30 piezas',12,'Niña',15,15,'https://placehold.co/600x600/EEE/31343C?text=ART-CAL'),
  ('11111111-1111-4111-8111-111111111111','REF-12A6','DIA-CAN','Diario con candado y set de escritura','Incluye bolígrafos y stickers',12,'Niña',16,16,'https://placehold.co/600x600/EEE/31343C?text=DIA-CAN');

-- Carpas por defecto: una por edad (0..13). Migra el comportamiento anterior
-- (la carpa era la edad). Kidotoy las reconfigura desde el panel: renombrar,
-- juntar edades en un punto o partir una edad en dos moviendo referencias.
insert into carpas (empresa_id, nombre, orden)
select '11111111-1111-4111-8111-111111111111', 'Carpa edad ' || g, g
from generate_series(0, 13) as g;

-- Cada referencia queda asignada a la carpa de su edad (nadie sin configuración).
insert into carpa_referencias (producto_id, carpa_id, empresa_id)
select p.id, c.id, p.empresa_id
from productos p
join carpas c on c.empresa_id = p.empresa_id and c.nombre = 'Carpa edad ' || p.edad;

insert into colaboradores (id, empresa_id, cedula, nombre, codigo_sap, correo, area) values
  ('22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-111111111111','52318904','Diana Patricia Salcedo Rojas','SAP-007340','dsalcedo@demo.local','Talento Humano'),
  ('22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-111111111111','80277714','Valeria Cortés Amaya','SAP-081083','colab01@demo.local','Planeación'),
  ('22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-111111111111','80556573','Salomé Moreno Díaz','SAP-024398','colab02@demo.local','Servicio al Cliente'),
  ('22222222-2222-4222-8222-000000000004','11111111-1111-4111-8111-111111111111','1020483984','Jerónimo Quintero Lara','SAP-038219','colab03@demo.local','Operaciones Zona 1'),
  ('22222222-2222-4222-8222-000000000005','11111111-1111-4111-8111-111111111111','52263139','Felipe Cárdenas Rojas','SAP-075384','colab04@demo.local','Mantenimiento'),
  ('22222222-2222-4222-8222-000000000006','11111111-1111-4111-8111-111111111111','1032473868','Catalina Ruiz Peña','SAP-088514','colab05@demo.local','Talento Humano'),
  ('22222222-2222-4222-8222-000000000007','11111111-1111-4111-8111-111111111111','1020954137','Isabella Valencia Nieto','SAP-090732','colab06@demo.local','Dirección Financiera'),
  ('22222222-2222-4222-8222-000000000008','11111111-1111-4111-8111-111111111111','1032953130','Samuel Salcedo Vargas','SAP-071390','colab07@demo.local','Operaciones Zona 1'),
  ('22222222-2222-4222-8222-000000000009','11111111-1111-4111-8111-111111111111','52382101','Antonia Moreno Díaz','SAP-043145','colab08@demo.local','Tecnología'),
  ('22222222-2222-4222-8222-000000000010','11111111-1111-4111-8111-111111111111','80298382','Antonia Moreno Díaz','SAP-054153','colab09@demo.local','Tecnología'),
  ('22222222-2222-4222-8222-000000000011','11111111-1111-4111-8111-111111111111','52685820','Daniel Beltrán Muñoz','SAP-012779','colab10@demo.local','Operaciones Zona 1'),
  ('22222222-2222-4222-8222-000000000012','11111111-1111-4111-8111-111111111111','52318727','Juanita Ospina Herrera','SAP-020905','colab11@demo.local','Dirección Financiera'),
  ('22222222-2222-4222-8222-000000000013','11111111-1111-4111-8111-111111111111','1020704900','Emilia Aguirre Pardo','SAP-036428','colab12@demo.local','Dirección Financiera'),
  ('22222222-2222-4222-8222-000000000014','11111111-1111-4111-8111-111111111111','79647355','Valeria Salcedo Vargas','SAP-004925','colab13@demo.local','Gestión Ambiental'),
  ('22222222-2222-4222-8222-000000000015','11111111-1111-4111-8111-111111111111','79796613','Juanita Moreno Díaz','SAP-076270','colab14@demo.local','Tecnología'),
  ('22222222-2222-4222-8222-000000000016','11111111-1111-4111-8111-111111111111','1020792878','Simón Cárdenas Rojas','SAP-077600','colab15@demo.local','Servicio al Cliente'),
  ('22222222-2222-4222-8222-000000000017','11111111-1111-4111-8111-111111111111','10849856','Felipe Naranjo Vega','SAP-052078','colab16@demo.local','Mantenimiento'),
  ('22222222-2222-4222-8222-000000000018','11111111-1111-4111-8111-111111111111','1020428940','Daniel Valencia Nieto','SAP-025503','colab17@demo.local','Operaciones Zona 3'),
  ('22222222-2222-4222-8222-000000000019','11111111-1111-4111-8111-111111111111','52548752','Emilia Salcedo Vargas','SAP-032655','colab18@demo.local','Mantenimiento'),
  ('22222222-2222-4222-8222-000000000020','11111111-1111-4111-8111-111111111111','79973633','Santiago Valencia Nieto','SAP-099374','colab19@demo.local','Mantenimiento'),
  ('22222222-2222-4222-8222-000000000021','11111111-1111-4111-8111-111111111111','1032936118','Jerónimo Bermúdez Silva','SAP-063983','colab20@demo.local','Gestión Ambiental'),
  ('22222222-2222-4222-8222-000000000022','11111111-1111-4111-8111-111111111111','1020260214','Manuela Salcedo Vargas','SAP-058120','colab21@demo.local','Servicio al Cliente'),
  ('22222222-2222-4222-8222-000000000023','11111111-1111-4111-8111-111111111111','52350129','Valeria Aguirre Pardo','SAP-095044','colab22@demo.local','Tecnología'),
  ('22222222-2222-4222-8222-000000000024','11111111-1111-4111-8111-111111111111','79423170','Sofía Ospina Herrera','SAP-065393','colab23@demo.local','Mantenimiento'),
  ('22222222-2222-4222-8222-000000000025','11111111-1111-4111-8111-111111111111','1020367863','Camila Ruiz Peña','SAP-045122','colab24@demo.local','Planeación');

insert into beneficiarios (empresa_id, colaborador_id, nombre, fecha_nacimiento, genero, edad) values
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','Jerónimo Salcedo Rojas','2023-09-01','Niño',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','Emiliano Salcedo Rojas','2019-01-17','Niño',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','Andrés Salcedo Rojas','2014-06-19','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000002','Matías Cortés Amaya','2014-06-01','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000003','Sofía Moreno Díaz','2019-02-24','Niña',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000004','Luciana Quintero Lara','2023-01-07','Niña',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000005','Julián Cárdenas Rojas','2019-11-03','Niño',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000005','Paulina Cárdenas Rojas','2023-03-24','Niña',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000006','Manuela Ruiz Peña','2014-08-19','Niña',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000007','Valeria Valencia Nieto','2019-09-26','Niña',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000007','Manuela Valencia Nieto','2014-02-06','Niña',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000007','Juanita Valencia Nieto','2014-03-16','Niña',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000008','Juanita Salcedo Vargas','2014-08-31','Niña',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000009','Isabella Moreno Díaz','2019-06-15','Niña',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000009','Martín Moreno Díaz','2019-10-06','Niño',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000010','Felipe Moreno Díaz','2023-08-06','Niño',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000010','Camila Moreno Díaz','2019-03-02','Niña',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000010','Santiago Moreno Díaz','2023-02-13','Niño',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000011','Paulina Beltrán Muñoz','2019-12-09','Niña',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000011','Paulina Beltrán Muñoz','2023-08-04','Niña',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000012','Tomás Ospina Herrera','2014-08-21','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000013','Valeria Aguirre Pardo','2023-06-18','Niña',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000014','Paulina Salcedo Vargas','2014-06-14','Niña',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000014','Isabella Salcedo Vargas','2023-11-26','Niña',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000015','Manuela Moreno Díaz','2019-12-05','Niña',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000016','Daniel Cárdenas Rojas','2014-02-28','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000016','Martín Cárdenas Rojas','2014-02-09','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000017','Luciana Naranjo Vega','2023-02-27','Niña',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000017','Camila Naranjo Vega','2023-03-29','Niña',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000018','Tomás Valencia Nieto','2014-11-30','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000018','Camila Valencia Nieto','2019-01-24','Niña',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000018','Jerónimo Valencia Nieto','2018-12-25','Niño',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000019','Andrés Salcedo Vargas','2014-09-22','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000020','Mariana Valencia Nieto','2014-07-27','Niña',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000021','Martín Bermúdez Silva','2014-07-01','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000022','Matías Salcedo Vargas','2013-12-19','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000023','Catalina Aguirre Pardo','2023-11-17','Niña',3),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000023','Gabriel Aguirre Pardo','2019-07-18','Niño',7),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000024','Felipe Ospina Herrera','2014-05-17','Niño',12),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000025','Gabriel Ruiz Peña','2014-04-29','Niño',12);

-- Verificación rápida
select 'colaboradores' t, count(*) from colaboradores
union all select 'beneficiarios', count(*) from beneficiarios
union all select 'productos', count(*) from productos;