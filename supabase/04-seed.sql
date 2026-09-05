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
  ('11111111-1111-4111-8111-111111111111','REFBX-688','KDT007911','Scooter infantil avión oso','Unisex,77x55cm',4,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF008-939A','KDT006018','Cocina vapor con luces y sonidos','Caja, 65x50cm',4,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REFRD129-','KDT007705','Mula más carro C/R','Caja, 49x14cm',4,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REFSY233K-3','KDT007806','Perro robot C/R luz sonidos pulsera humo','Caja, 28x15cm',4,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REFTT2303','KDT006207','Scooter 5 en 1 mariquita','55x94cm',4,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REFHK8010','KDT006169','Guitarra karaoke con amplificador','26x73cm',4,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF928-3','KDT007139','Carro Deportivo Niña C/R Con Humo','Caja, 24 cm × 45 cm × 20 cm',6,'Niña',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF216A','KDT007800','Carruaje con Muñeca GD Movimiento','Caja, 60 cm × 34 cm',6,'Niña',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF008-969','KDT005228','Cocina Luz, Sonidos, Agua 53 PCS en Caja','Caja, 69 cm × 53 cm',6,'Niña',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF556-75','KDT005614','Casa de Muñecas GD 188 PCS','Caja, 59 cm × 40 cm',6,'Niña',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REFYL70015A','KDT007794','Tocador Piano Abre Puertas Luces y Sonidos','Caja, 57 cm × 50 cm',6,'Niña',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF008-980A-4','KDT006024','Maleta Ruedas Veterinaria','57 cm alto × 44 cm largo',6,'Niña',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF51004','KDT008678','Juego de Mesa Tío Rico De Lujo GD','40,5 cm × 27 cm',10,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REFF36050','KDT006083','Telescopio GD En CJ','22 cm × 43 cm largo',10,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF286-21','KDT006490','Drone con Camara S9000','Caja, 22 cm × 23,5 cm × 6 cm',10,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REFJY018-1','KDT006424','Perro Robot C/R Inteligente Musical','Caja, 35 cm × 27 cm',10,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REFJJ35-2','KDT005764','Pista de Carros Eléctrica C/R Racing','Caja 50 × 120 cm',10,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF333-PZ22166','KDT008010','Carro C/R GTE Llanta Drift Explosive Wheel','Caja, 46 cm × 24 cm',10,'Niño',10,10,null),
  ('11111111-1111-4111-8111-111111111111','REF7007-2A','KDT008183','Cancha Elefante 3 en 1 con Luces y Sonidos','Unisex, caja, 58 cm × 44,5 cm',2,'Niña',8,8,null),
  ('11111111-1111-4111-8111-111111111111','REFHE0816/HE0817','KDT008002','Andadera 4 en 1 Mesa Patineta Triciclo','Niña, caja, 46,5 cm × 37 cm',2,'Niña',8,8,null),
  ('11111111-1111-4111-8111-111111111111','REF68146','KDT008813','Silla Mecedora Rocker Con Música y Funciones','Unisex, caja, 54 cm × 38,5 cm',2,'Niña',8,8,null),
  ('11111111-1111-4111-8111-111111111111','REFPH-KL08','KDT006498','Bicicleta Equilibrio Infantil Lujo','Unisex, caja, 81 cm × 23 cm',2,'Niña',8,8,null),
  ('11111111-1111-4111-8111-111111111111','REFPF4200-2','KDT006196','Deslizadero Niña en Caja','Niña, 95 cm × 36 cm',2,'Niña',8,8,null),
  ('11111111-1111-4111-8111-111111111111','REFJB-601','KDT006214','Montable Jirafa 4 Llantas','Unisex',2,'Niña',8,8,null);

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
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','Jerónimo Salcedo Rojas','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','Valentina Salcedo Rojas','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000001','Andrés Salcedo Rojas','2016-05-10','Niño',10),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000002','Matías Cortés Amaya','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000003','Sofía Moreno Díaz','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000004','Luciana Quintero Lara','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000005','Julián Cárdenas Rojas','2016-05-10','Niño',10),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000005','Paulina Cárdenas Rojas','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000006','Manuela Ruiz Peña','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000007','Valeria Valencia Nieto','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000007','Manuela Valencia Nieto','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000007','Juanita Valencia Nieto','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000008','Juanita Salcedo Vargas','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000009','Isabella Moreno Díaz','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000009','Martín Moreno Díaz','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000010','Felipe Moreno Díaz','2016-05-10','Niño',10),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000010','Camila Moreno Díaz','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000010','Santiago Moreno Díaz','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000011','Paulina Beltrán Muñoz','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000011','Paulina Beltrán Muñoz','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000012','Tomás Ospina Herrera','2016-05-10','Niño',10),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000013','Valeria Aguirre Pardo','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000014','Paulina Salcedo Vargas','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000014','Isabella Salcedo Vargas','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000015','Manuela Moreno Díaz','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000016','Daniel Cárdenas Rojas','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000016','Martín Cárdenas Rojas','2016-05-10','Niño',10),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000017','Luciana Naranjo Vega','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000017','Camila Naranjo Vega','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000018','Tomás Valencia Nieto','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000018','Camila Valencia Nieto','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000018','Jerónimo Valencia Nieto','2016-05-10','Niño',10),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000019','Andrés Salcedo Vargas','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000020','Mariana Valencia Nieto','2020-05-10','Niña',6),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000021','Martín Bermúdez Silva','2016-05-10','Niño',10),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000022','Matías Salcedo Vargas','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000023','Catalina Aguirre Pardo','2024-05-10','Niña',2),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000023','Gabriel Aguirre Pardo','2016-05-10','Niño',10),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000024','Felipe Ospina Herrera','2022-05-10','Niño',4),
  ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-000000000025','Gabriel Ruiz Peña','2016-05-10','Niño',10);

-- Verificación rápida
select 'colaboradores' t, count(*) from colaboradores
union all select 'beneficiarios', count(*) from beneficiarios
union all select 'productos', count(*) from productos;