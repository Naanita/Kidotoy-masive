-- =====================================================================
-- Plataforma de selección de regalos · Esquema
-- Ejecutar en orden: 01-schema, 02-rls, 03-funciones, 04-seed
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- empresas
create table empresas (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  nombre          text not null,
  nit             text,
  fecha_corte     date not null,
  ventana_inicio  timestamptz,
  ventana_fin     timestamptz,
  evento_fecha    date,
  evento_lugar    text,
  activa          boolean not null default true,
  banner_demo     boolean not null default true,
  creado_en       timestamptz not null default now()
);
comment on column empresas.banner_demo is
  'Muestra el banner de "versión de demostración". Se controla desde /dev/parametros.';
comment on column empresas.fecha_corte is
  'Fecha contra la cual se calcula la edad de TODOS los beneficiarios. Nunca usar now().';

-- ---------------------------------------------------------------- tema
create table tema (
  empresa_id  uuid primary key references empresas(id) on delete cascade,
  tokens      jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz not null default now()
);
comment on table tema is
  'Tokens de diseño por empresa. Validar contra lista blanca antes de inyectar en CSS.';

-- ---------------------------------------------------------------- colaboradores
create table colaboradores (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references empresas(id) on delete cascade,
  cedula        text not null,
  nombre        text not null,
  codigo_sap    text not null,
  correo        text,
  area          text,
  auth_user_id  uuid unique,
  creado_en     timestamptz not null default now(),
  unique (empresa_id, cedula)
);
create index on colaboradores (empresa_id, cedula);

-- ---------------------------------------------------------------- beneficiarios
create table beneficiarios (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references empresas(id) on delete cascade,
  colaborador_id    uuid not null references colaboradores(id) on delete cascade,
  nombre            text not null,
  fecha_nacimiento  date not null,
  genero            text not null check (genero in ('Niño','Niña')),
  edad              int  not null check (edad between 0 and 13),
  creado_en         timestamptz not null default now()
);
create index on beneficiarios (colaborador_id);
create index on beneficiarios (empresa_id, edad, genero);
comment on column beneficiarios.edad is
  'Materializada contra empresas.fecha_corte. Recalcular con recalcular_edades().';

-- ---------------------------------------------------------------- productos
create table productos (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references empresas(id) on delete cascade,
  codigo_referencia text not null,
  sku               text,
  nombre            text not null,
  descripcion       text,
  edad              int  not null check (edad between 0 and 13),
  genero            text not null check (genero in ('Niño','Niña')),
  stock_inicial     int  not null check (stock_inicial >= 0),
  stock_disponible  int  not null check (stock_disponible >= 0),
  imagen_url        text,
  activo            boolean not null default true,
  creado_en         timestamptz not null default now(),
  unique (empresa_id, codigo_referencia),
  check (stock_disponible <= stock_inicial)
);
create index on productos (empresa_id, edad, genero, activo);
comment on column productos.sku is
  'Código físico de bodega. Un juguete unisex va en dos filas con distinto codigo_referencia y el MISMO sku.';

-- ---------------------------------------------------------------- carpas
-- Puntos físicos de entrega del evento. La carpa NO es la edad: Kidotoy puede
-- juntar dos edades en un punto o partir una edad numerosa en dos. Qué juguete
-- se despacha en cada carpa se define por referencia (carpa_referencias).
create table carpas (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas(id) on delete cascade,
  nombre      text not null,
  orden       int  not null default 0,
  creado_en   timestamptz not null default now(),
  unique (empresa_id, nombre)
);
create index on carpas (empresa_id, orden);

-- Asignación referencia → carpa. Cada referencia se despacha en UNA carpa
-- (el juguete físico está en un punto). Una referencia sin fila aquí queda
-- SIN carpa: nadie puede entregarla → alerta en el panel.
create table carpa_referencias (
  producto_id uuid primary key references productos(id) on delete cascade,
  carpa_id    uuid not null references carpas(id) on delete cascade,
  empresa_id  uuid not null references empresas(id) on delete cascade
);
create index on carpa_referencias (carpa_id);

-- ---------------------------------------------------------------- operarios
-- Una cuenta por persona de entrega (el día del evento son ~14 a la vez; una
-- cuenta compartida haría inútil la auditoría). Cada operario trabaja en una
-- carpa asignada, editable desde el panel de Kidotoy.
create table operarios (
  auth_user_id uuid primary key,
  empresa_id   uuid not null references empresas(id) on delete cascade,
  nombre       text not null,
  correo       text,
  carpa_id     uuid references carpas(id) on delete set null,
  creado_en    timestamptz not null default now()
);
create index on operarios (empresa_id);

-- ---------------------------------------------------------------- selecciones
create table selecciones (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references empresas(id) on delete cascade,
  beneficiario_id uuid not null unique references beneficiarios(id) on delete cascade,
  colaborador_id  uuid not null references colaboradores(id) on delete cascade,
  producto_id     uuid not null references productos(id),
  codigo_entrega  text not null unique,
  confirmada_en   timestamptz not null default now()
);
create index on selecciones (empresa_id, colaborador_id);
comment on constraint selecciones_beneficiario_id_key on selecciones is
  'Un juguete por beneficiario. Garantía en base de datos, no solo en la aplicación.';

-- ---------------------------------------------------------------- entregas
create table entregas (
  id                uuid primary key default gen_random_uuid(),
  empresa_id        uuid not null references empresas(id) on delete cascade,
  seleccion_id      uuid not null unique references selecciones(id) on delete cascade,
  entregado_en      timestamptz not null default now(),
  operario          text,
  carpa_id          uuid references carpas(id) on delete set null,
  operario_carpa_id uuid references carpas(id) on delete set null,
  fuera_de_carpa    boolean not null default false,
  jornada           text not null default 'principal' check (jornada in ('principal','rezagados')),
  sincronizado_en   timestamptz
);
comment on column entregas.carpa_id is
  'Carpa asignada de la referencia entregada (dónde DEBÍA despacharse). El avance por carpa agrupa por esta columna.';
comment on column entregas.fuera_de_carpa is
  'true si el operario entregó desde otra carpa distinta a la de la referencia. No se bloquea, pero queda registrado para cuadrar el conteo por punto.';
comment on column entregas.sincronizado_en is
  'Reservado para el modo sin conexión de producción. Nulo = registrado localmente, aún sin sincronizar.';

-- ---------------------------------------------------------------- intentos de acceso
create table intentos_acceso (
  id              bigserial primary key,
  empresa_id      uuid references empresas(id) on delete cascade,
  cedula          text not null,
  exitoso         boolean not null,
  ip              text,
  intentado_en    timestamptz not null default now()
);
create index on intentos_acceso (cedula, intentado_en desc);

-- ---------------------------------------------------------------- auditoría
create table auditoria (
  id          bigserial primary key,
  empresa_id  uuid references empresas(id) on delete cascade,
  actor       text,
  rol         text,
  accion      text not null,
  entidad     text,
  entidad_id  uuid,
  detalle     jsonb,
  ocurrido_en timestamptz not null default now()
);
create index on auditoria (empresa_id, ocurrido_en desc);

-- ---------------------------------------------------------------- vistas
create view v_avance_campana as
select
  b.empresa_id,
  count(*)                                             as total_beneficiarios,
  count(s.id)                                          as confirmados,
  count(*) - count(s.id)                               as pendientes,
  round(100.0 * count(s.id) / nullif(count(*),0), 1)   as porcentaje
from beneficiarios b
left join selecciones s on s.beneficiario_id = b.id
group by b.empresa_id;

create view v_inventario_por_grupo as
select
  empresa_id, edad, genero,
  count(*)                       as referencias,
  sum(stock_inicial)             as unidades_iniciales,
  sum(stock_disponible)          as unidades_disponibles,
  sum(stock_inicial - stock_disponible) as unidades_consumidas
from productos
where activo
group by empresa_id, edad, genero;

-- ---------------------------------------------------------------- realtime
-- Disponibilidad en vivo del catálogo (cosmético: la verdad la dicta
-- confirmar_seleccion). Se agrega productos a la publicación de Realtime.
-- Idempotente: no falla si ya es miembro.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'productos'
  ) then
    alter publication supabase_realtime add table productos;
  end if;
end $$;
