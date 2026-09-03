-- =====================================================================
-- Funciones de negocio
-- =====================================================================

-- ---------------------------------------------------------------------
-- confirmar_seleccion — EL CORAZÓN DEL SISTEMA
--
-- Descuenta inventario de forma atómica. El UPDATE con la condición
-- stock_disponible > 0 es lo que impide que dos colaboradores tomen la
-- última unidad: Postgres serializa las escrituras sobre la misma fila,
-- así que el segundo no encuentra fila y recibe SIN_STOCK.
--
-- NUNCA replicar esta lógica en la aplicación.
-- ---------------------------------------------------------------------
create or replace function confirmar_seleccion(
  p_beneficiario_id uuid,
  p_producto_id     uuid
) returns jsonb
language plpgsql
security definer
-- extensions: en Supabase pgcrypto (gen_random_bytes) vive ahí, no en public.
set search_path = public, extensions
as $$
declare
  v_empresa     uuid;
  v_colaborador uuid;
  v_edad        int;
  v_genero      text;
  v_restante    int;
  v_codigo      text;
  v_id          uuid;
  v_nombre      text;
  v_ini         timestamptz;
  v_fin         timestamptz;
begin
  select b.empresa_id, b.colaborador_id, b.edad, b.genero
    into v_empresa, v_colaborador, v_edad, v_genero
  from beneficiarios b
  where b.id = p_beneficiario_id;

  if not found then
    raise exception 'BENEFICIARIO_NO_EXISTE';
  end if;

  -- El colaborador solo puede seleccionar para sus propios hijos.
  if auth_rol() = 'colaborador' and v_colaborador is distinct from auth_colaborador_id() then
    raise exception 'NO_AUTORIZADO';
  end if;

  if exists (select 1 from selecciones where beneficiario_id = p_beneficiario_id) then
    raise exception 'YA_TIENE_SELECCION';
  end if;

  -- Ventana de selección: la valida la BASE, no solo la interfaz. Un botón
  -- deshabilitado no es una restricción. Las fechas salen de empresas, nunca
  -- se escriben en código. Fuera de ventana no se puede confirmar; el que ya
  -- confirmó conserva su comprobante (esto no toca lo ya guardado).
  select ventana_inicio, ventana_fin into v_ini, v_fin
  from empresas where id = v_empresa;
  if (v_ini is not null and now() < v_ini)
     or (v_fin is not null and now() > v_fin) then
    raise exception 'FUERA_DE_VENTANA';
  end if;

  -- Descuento atómico. La condición de stock va DENTRO del update.
  update productos
     set stock_disponible = stock_disponible - 1
   where id      = p_producto_id
     and empresa_id = v_empresa
     and edad    = v_edad          -- el producto debe corresponder al grupo del niño
     and genero  = v_genero
     and activo
     and stock_disponible > 0
  returning stock_disponible, nombre into v_restante, v_nombre;

  if not found then
    raise exception 'SIN_STOCK';
  end if;

  v_codigo := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 10));

  insert into selecciones (empresa_id, beneficiario_id, colaborador_id, producto_id, codigo_entrega)
  values (v_empresa, p_beneficiario_id, v_colaborador, p_producto_id, v_codigo)
  returning id into v_id;

  insert into auditoria (empresa_id, actor, rol, accion, entidad, entidad_id, detalle)
  values (v_empresa, coalesce(auth.uid()::text,'sistema'), auth_rol(), 'confirmar_seleccion',
          'selecciones', v_id,
          jsonb_build_object('beneficiario_id', p_beneficiario_id,
                             'producto_id', p_producto_id,
                             'stock_restante', v_restante));

  return jsonb_build_object(
    'seleccion_id',   v_id,
    'codigo_entrega', v_codigo,
    'producto',       v_nombre,
    'stock_restante', v_restante
  );
end $$;

-- ---------------------------------------------------------------------
-- liberar_seleccion — desbloqueo administrado, con motivo obligatorio
-- ---------------------------------------------------------------------
create or replace function liberar_seleccion(
  p_seleccion_id uuid,
  p_motivo       text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_producto uuid;
  v_empresa  uuid;
  v_benef    uuid;
begin
  if not es_admin() then
    raise exception 'NO_AUTORIZADO';
  end if;

  -- El motivo es un registro de auditoría, no un trámite: mínimo 10 caracteres
  -- reales, para que no se llene con "test" o un punto.
  if p_motivo is null or length(trim(p_motivo)) < 10 then
    raise exception 'MOTIVO_REQUERIDO';
  end if;

  if exists (select 1 from entregas where seleccion_id = p_seleccion_id) then
    raise exception 'YA_ENTREGADO';
  end if;

  select producto_id, empresa_id, beneficiario_id
    into v_producto, v_empresa, v_benef
  from selecciones where id = p_seleccion_id;

  if not found then
    raise exception 'SELECCION_NO_EXISTE';
  end if;

  delete from selecciones where id = p_seleccion_id;

  update productos
     set stock_disponible = least(stock_disponible + 1, stock_inicial)
   where id = v_producto;

  insert into auditoria (empresa_id, actor, rol, accion, entidad, entidad_id, detalle)
  values (v_empresa, coalesce(auth.uid()::text,'sistema'), auth_rol(), 'liberar_seleccion',
          'selecciones', p_seleccion_id,
          jsonb_build_object('motivo', p_motivo, 'beneficiario_id', v_benef,
                             'producto_id', v_producto));

  return jsonb_build_object('liberada', true, 'beneficiario_id', v_benef);
end $$;

-- ---------------------------------------------------------------------
-- actualizar_stock — edición administrada del total de una referencia.
--
-- El admin fija el nuevo total de unidades (stock_inicial). La regla que la
-- BASE garantiza (no solo la interfaz): el nuevo total NUNCA puede quedar por
-- debajo de lo ya consumido. Si hay 12 iniciales y 5 confirmadas (consumido=5),
-- el mínimo es 5. Se recalcula stock_disponible = nuevo_total - consumido.
--
-- SELECT ... FOR UPDATE serializa contra confirmar_seleccion(): si un
-- colaborador está tomando una unidad de la misma fila, se espera el lock y el
-- consumido se lee sin condición de carrera.
-- ---------------------------------------------------------------------
create or replace function actualizar_stock(
  p_producto_id  uuid,
  p_nuevo_inicial int
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa   uuid;
  v_ini       int;
  v_disp      int;
  v_consumido int;
  v_nombre    text;
begin
  if not es_admin() then
    raise exception 'NO_AUTORIZADO';
  end if;
  if p_nuevo_inicial is null or p_nuevo_inicial < 0 then
    raise exception 'STOCK_INVALIDO';
  end if;

  select empresa_id, stock_inicial, stock_disponible, nombre
    into v_empresa, v_ini, v_disp, v_nombre
  from productos
  where id = p_producto_id
    and empresa_id = auth_empresa_id()
  for update;

  if not found then
    raise exception 'PRODUCTO_NO_EXISTE';
  end if;

  v_consumido := v_ini - v_disp;

  if p_nuevo_inicial < v_consumido then
    raise exception 'STOCK_MENOR_QUE_CONSUMIDO:%', v_consumido;
  end if;

  update productos
     set stock_inicial    = p_nuevo_inicial,
         stock_disponible = p_nuevo_inicial - v_consumido
   where id = p_producto_id;

  insert into auditoria (empresa_id, actor, rol, accion, entidad, entidad_id, detalle)
  values (v_empresa, coalesce(auth.uid()::text,'sistema'), auth_rol(), 'actualizar_stock',
          'productos', p_producto_id,
          jsonb_build_object('stock_inicial_antes', v_ini, 'stock_inicial_despues', p_nuevo_inicial,
                             'consumido', v_consumido));

  return jsonb_build_object(
    'stock_inicial',    p_nuevo_inicial,
    'stock_disponible', p_nuevo_inicial - v_consumido,
    'consumido',        v_consumido,
    'producto',         v_nombre
  );
end $$;

-- ---------------------------------------------------------------------
-- crear_producto / actualizar_producto — gestión de catálogo con auditoría.
-- Toda mutación relevante deja registro en auditoria; por eso pasan por
-- función (SECURITY DEFINER) en vez de un UPDATE directo, que además no podría
-- escribir en auditoria (sin política de insert para el rol autenticado).
-- El stock NO se toca aquí: eso es actualizar_stock, con su propia regla.
-- ---------------------------------------------------------------------
create or replace function crear_producto(
  p_codigo_referencia text,
  p_nombre            text,
  p_edad              int,
  p_genero            text,
  p_stock_inicial     int,
  p_sku               text default null,
  p_descripcion       text default null,
  p_imagen_url        text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa uuid := auth_empresa_id();
  v_id      uuid;
begin
  if not es_admin() then raise exception 'NO_AUTORIZADO'; end if;
  if coalesce(trim(p_codigo_referencia),'') = '' or coalesce(trim(p_nombre),'') = '' then
    raise exception 'DATOS_INCOMPLETOS';
  end if;
  if p_stock_inicial is null or p_stock_inicial < 0 then
    raise exception 'STOCK_INVALIDO';
  end if;
  if p_genero not in ('Niño','Niña') then raise exception 'GENERO_INVALIDO'; end if;
  if p_edad < 0 or p_edad > 13 then raise exception 'EDAD_INVALIDA'; end if;

  insert into productos (empresa_id, codigo_referencia, sku, nombre, descripcion,
                         edad, genero, stock_inicial, stock_disponible, imagen_url)
  values (v_empresa, trim(p_codigo_referencia), nullif(trim(p_sku),''), trim(p_nombre),
          nullif(trim(p_descripcion),''), p_edad, p_genero, p_stock_inicial, p_stock_inicial,
          nullif(trim(p_imagen_url),''))
  returning id into v_id;

  insert into auditoria (empresa_id, actor, rol, accion, entidad, entidad_id, detalle)
  values (v_empresa, coalesce(auth.uid()::text,'sistema'), auth_rol(), 'crear_producto',
          'productos', v_id, jsonb_build_object('codigo_referencia', p_codigo_referencia,
                             'edad', p_edad, 'genero', p_genero, 'stock_inicial', p_stock_inicial));

  return jsonb_build_object('id', v_id);
exception
  when unique_violation then raise exception 'CODIGO_DUPLICADO';
end $$;

create or replace function actualizar_producto(
  p_producto_id uuid,
  p_nombre      text,
  p_descripcion text,
  p_imagen_url  text,
  p_activo      boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa uuid := auth_empresa_id();
begin
  if not es_admin() then raise exception 'NO_AUTORIZADO'; end if;
  if coalesce(trim(p_nombre),'') = '' then raise exception 'DATOS_INCOMPLETOS'; end if;

  update productos
     set nombre      = trim(p_nombre),
         descripcion = nullif(trim(p_descripcion),''),
         imagen_url  = nullif(trim(p_imagen_url),''),
         activo      = coalesce(p_activo, activo)
   where id = p_producto_id and empresa_id = v_empresa;

  if not found then raise exception 'PRODUCTO_NO_EXISTE'; end if;

  insert into auditoria (empresa_id, actor, rol, accion, entidad, entidad_id, detalle)
  values (v_empresa, coalesce(auth.uid()::text,'sistema'), auth_rol(), 'actualizar_producto',
          'productos', p_producto_id, jsonb_build_object('activo', p_activo));

  return jsonb_build_object('actualizado', true);
end $$;

-- ---------------------------------------------------------------------
-- registrar_entrega — registra la entrega física de un regalo.
--
-- La carpa de la entrega es la carpa ASIGNADA a la referencia (dónde debía
-- despacharse), no la edad. Si el operario trabaja en otra carpa NO se bloquea
-- (si la familia ya está ahí, se entrega igual), pero queda fuera_de_carpa=true
-- para que el conteo por punto cuadre después. El avance por carpa agrupa por
-- carpa_id (la de la referencia).
-- ---------------------------------------------------------------------
create or replace function registrar_entrega(
  p_codigo_entrega    text,
  p_operario          text,
  p_operario_carpa_id uuid default null,
  p_jornada           text default 'principal'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sel          record;
  v_prev         record;
  v_carpa_id     uuid;
  v_carpa_nom    text;
  v_op_carpa_nom text;
  v_fuera        boolean;
begin
  select s.id, s.empresa_id, s.producto_id, b.nombre as beneficiario, b.edad,
         p.nombre as producto, p.imagen_url
    into v_sel
  from selecciones s
  join beneficiarios b on b.id = s.beneficiario_id
  join productos p     on p.id = s.producto_id
  where upper(s.codigo_entrega) = upper(trim(p_codigo_entrega));

  if not found then
    raise exception 'CODIGO_NO_EXISTE';
  end if;

  -- Carpa asignada de la referencia (puede no tener → juguete sin carpa).
  select cr.carpa_id, c.nombre into v_carpa_id, v_carpa_nom
  from carpa_referencias cr
  join carpas c on c.id = cr.carpa_id
  where cr.producto_id = v_sel.producto_id;

  select nombre into v_op_carpa_nom from carpas where id = p_operario_carpa_id;

  v_fuera := (p_operario_carpa_id is not null and v_carpa_id is not null
              and p_operario_carpa_id is distinct from v_carpa_id);

  select e.entregado_en, e.operario, cc.nombre as carpa_nombre
    into v_prev
  from entregas e
  left join carpas cc on cc.id = e.carpa_id
  where e.seleccion_id = v_sel.id;
  if found then
    return jsonb_build_object(
      'ya_entregado', true,
      'entregado_en', v_prev.entregado_en,
      'operario',     v_prev.operario,
      'beneficiario', v_sel.beneficiario,
      'producto',     v_sel.producto,
      'carpa',        v_prev.carpa_nombre
    );
  end if;

  insert into entregas (empresa_id, seleccion_id, operario, carpa_id, operario_carpa_id,
                        fuera_de_carpa, jornada, sincronizado_en)
  values (v_sel.empresa_id, v_sel.id, p_operario, v_carpa_id, p_operario_carpa_id,
          v_fuera, p_jornada, now());

  return jsonb_build_object(
    'ya_entregado',   false,
    'beneficiario',   v_sel.beneficiario,
    'producto',       v_sel.producto,
    'imagen_url',     v_sel.imagen_url,
    'carpa',          v_carpa_nom,           -- carpa asignada de la referencia
    'carpa_id',       v_carpa_id,
    'sin_carpa',      (v_carpa_id is null),
    'fuera_de_carpa', v_fuera,
    'carpa_operario', v_op_carpa_nom
  );
exception
  when unique_violation then
    -- Dos operarios escanearon el mismo código a la vez: el unique sobre
    -- seleccion_id deja pasar solo uno (nunca dos éxitos); el perdedor recibe
    -- "ya entregado", no un error.
    select e.entregado_en, e.operario, cc.nombre as carpa_nombre
      into v_prev
    from entregas e left join carpas cc on cc.id = e.carpa_id
    where e.seleccion_id = v_sel.id;
    return jsonb_build_object(
      'ya_entregado', true,
      'entregado_en', v_prev.entregado_en,
      'operario',     v_prev.operario,
      'beneficiario', v_sel.beneficiario,
      'producto',     v_sel.producto,
      'carpa',        v_prev.carpa_nombre
    );
end $$;

-- ---------------------------------------------------------------------
-- revertir_entrega — deshace una entrega marcada por error.
-- Admin-only, motivo obligatorio (>= 10) y auditoría, igual que
-- liberar_seleccion. Devuelve la selección a "confirmada, sin entregar"
-- para poder registrarla de nuevo. El delete pasa por esta función porque
-- entregas no tiene política de delete para el rol autenticado.
-- ---------------------------------------------------------------------
create or replace function revertir_entrega(
  p_seleccion_id uuid,
  p_motivo       text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa uuid;
  v_entrega uuid;
  v_benef   uuid;
begin
  if not es_admin() then
    raise exception 'NO_AUTORIZADO';
  end if;
  if p_motivo is null or length(trim(p_motivo)) < 10 then
    raise exception 'MOTIVO_REQUERIDO';
  end if;

  select id, empresa_id into v_entrega, v_empresa
  from entregas where seleccion_id = p_seleccion_id;
  if not found then
    raise exception 'ENTREGA_NO_EXISTE';
  end if;

  select beneficiario_id into v_benef from selecciones where id = p_seleccion_id;

  delete from entregas where seleccion_id = p_seleccion_id;

  insert into auditoria (empresa_id, actor, rol, accion, entidad, entidad_id, detalle)
  values (v_empresa, coalesce(auth.uid()::text,'sistema'), auth_rol(), 'revertir_entrega',
          'entregas', v_entrega,
          jsonb_build_object('motivo', p_motivo, 'seleccion_id', p_seleccion_id,
                             'beneficiario_id', v_benef));

  return jsonb_build_object('revertida', true, 'beneficiario_id', v_benef);
end $$;

-- ---------------------------------------------------------------------
-- recalcular_edades — usar si cambia empresas.fecha_corte
-- ---------------------------------------------------------------------
create or replace function recalcular_edades(p_empresa_id uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare v_corte date; v_n int;
begin
  select fecha_corte into v_corte from empresas where id = p_empresa_id;
  update beneficiarios
     set edad = extract(year from age(v_corte, fecha_nacimiento))::int
   where empresa_id = p_empresa_id;
  get diagnostics v_n = row_count;
  return v_n;
end $$;

-- ---------------------------------------------------------------------
-- verificar_intentos — bloqueo por cédula tras 5 fallos en 15 minutos
-- ---------------------------------------------------------------------
create or replace function verificar_intentos(p_cedula text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select count(*) < 5
  from intentos_acceso
  where cedula = p_cedula
    and not exitoso
    and intentado_en > now() - interval '15 minutes'
$$;

-- ---------------------------------------------------------------------
-- registrar_intento_acceso — deja constancia de un intento de login.
--
-- SECURITY DEFINER + grant a anon porque el login del colaborador ocurre
-- SIN sesión (cédula + código SAP), y la tabla intentos_acceso tiene RLS
-- sin política de escritura para anon. La IP se guarda solo para auditoría,
-- nunca se cuenta (los colaboradores del Acueducto probablemente salen por
-- una IP corporativa compartida; contar por IP bloquearía a toda la oficina).
--
-- Un intento fallido, una vez grabado, es INMUTABLE: no existe ninguna función
-- que lo vuelva 'exitoso' desde anon. Si existiera, un atacante podría limpiar
-- su propio historial y burlar el bloqueo. Por eso el login registra el
-- resultado real una sola vez, en lugar de insertar 'falso' y luego voltearlo.
-- ---------------------------------------------------------------------
create or replace function registrar_intento_acceso(
  p_cedula  text,
  p_exitoso boolean,
  p_ip      text default null
) returns void
language sql
security definer
set search_path = public
as $$
  insert into intentos_acceso (cedula, exitoso, ip)
  values (p_cedula, p_exitoso, p_ip)
$$;

grant execute on function verificar_intentos(text) to anon;
grant execute on function registrar_intento_acceso(text, boolean, text) to anon;

-- ---------------------------------------------------------------------
-- ping — actividad para el keepalive del plan gratuito de Supabase.
-- Se llama por RPC con la anon key. Una llamada cuenta como actividad
-- igual que una consulta a tabla, sin exponer la service role key en
-- una ruta pública. Ver /api/keepalive.
-- ---------------------------------------------------------------------
create or replace function ping() returns timestamptz
language sql security definer set search_path = public
as $$ select now() $$;
grant execute on function ping() to anon;

-- ---------------------------------------------------------------------
-- config_publica — lectura anónima de lo MÍNIMO para pintar la pantalla
-- de login de la empresa activa antes de que exista sesión: nombre visible,
-- tokens de tema (el logo vive dentro de los tokens) y la bandera del banner.
-- SECURITY DEFINER + grant a anon, mismo patrón que ping(): evita la service
-- role key en el cliente y no toca RLS.
--
-- Es una ruta pública sin autenticar que recibe un slug: NO devuelve nada más
-- que lo que la pantalla necesita. Sin id de empresa, sin slug, sin nit, sin
-- fechas de corte/ventana, sin evento. Así, cuando haya varias empresas, no se
-- puede enumerar slugs para extraer más que la marca visible de cada cliente.
-- Nunca datos de colaboradores ni de menores.
-- ---------------------------------------------------------------------
create or replace function config_publica(p_slug text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'marca_nombre', e.nombre,
    'banner_demo',  e.banner_demo,
    'tokens',       coalesce(t.tokens, '{}'::jsonb)
  )
  from empresas e
  left join tema t on t.empresa_id = e.id
  where e.slug = p_slug and e.activa
  limit 1
$$;
grant execute on function config_publica(text) to anon;
