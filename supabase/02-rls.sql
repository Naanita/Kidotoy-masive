-- =====================================================================
-- Row Level Security
-- El aislamiento vive aquí, no en el código de la aplicación.
-- =====================================================================

create or replace function auth_empresa_id() returns uuid
language sql stable as $$
  select nullif(
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'empresa_id',
      ''
    ), ''
  )::uuid
$$;

create or replace function auth_rol() returns text
language sql stable as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'rol',
    'anonimo'
  )
$$;

create or replace function auth_colaborador_id() returns uuid
language sql stable as $$
  select c.id from colaboradores c
  where c.auth_user_id = auth.uid()
$$;

create or replace function es_admin() returns boolean
language sql stable as $$
  select auth_rol() in ('admin_kidotoy','admin_dev')
$$;

alter table empresas       enable row level security;
alter table tema           enable row level security;
alter table colaboradores  enable row level security;
alter table beneficiarios  enable row level security;
alter table productos      enable row level security;
alter table selecciones    enable row level security;
alter table entregas       enable row level security;
alter table carpas         enable row level security;
alter table carpa_referencias enable row level security;
alter table operarios      enable row level security;
alter table auditoria      enable row level security;
alter table intentos_acceso enable row level security;

-- empresas -------------------------------------------------------------
create policy empresa_lectura on empresas for select
  using (id = auth_empresa_id());
create policy empresa_admin on empresas for all
  using (es_admin() and id = auth_empresa_id())
  with check (es_admin() and id = auth_empresa_id());

-- tema -----------------------------------------------------------------
create policy tema_lectura on tema for select
  using (empresa_id = auth_empresa_id());
create policy tema_escritura on tema for all
  using (auth_rol() = 'admin_dev')
  with check (auth_rol() = 'admin_dev');

-- colaboradores --------------------------------------------------------
create policy colab_propio on colaboradores for select
  using (auth_user_id = auth.uid());
create policy colab_gestion on colaboradores for select
  using (empresa_id = auth_empresa_id()
         and auth_rol() in ('admin_kidotoy','admin_dev','empresa_cliente','operario_entrega'));
create policy colab_admin on colaboradores for all
  using (es_admin() and empresa_id = auth_empresa_id())
  with check (es_admin() and empresa_id = auth_empresa_id());

-- beneficiarios --------------------------------------------------------
-- El colaborador SOLO ve a sus propios hijos.
create policy benef_propios on beneficiarios for select
  using (colaborador_id = auth_colaborador_id());
create policy benef_gestion on beneficiarios for select
  using (empresa_id = auth_empresa_id()
         and auth_rol() in ('admin_kidotoy','admin_dev','empresa_cliente','operario_entrega'));
create policy benef_admin on beneficiarios for all
  using (es_admin() and empresa_id = auth_empresa_id())
  with check (es_admin() and empresa_id = auth_empresa_id());

-- productos ------------------------------------------------------------
create policy prod_lectura on productos for select
  using (empresa_id = auth_empresa_id() and activo);
create policy prod_admin on productos for all
  using (es_admin() and empresa_id = auth_empresa_id())
  with check (es_admin() and empresa_id = auth_empresa_id());

-- selecciones ----------------------------------------------------------
-- Sin INSERT ni UPDATE directo: todo pasa por confirmar_seleccion().
create policy selec_propias on selecciones for select
  using (colaborador_id = auth_colaborador_id());
create policy selec_gestion on selecciones for select
  using (empresa_id = auth_empresa_id()
         and auth_rol() in ('admin_kidotoy','admin_dev','empresa_cliente','operario_entrega'));
create policy selec_admin on selecciones for all
  using (es_admin() and empresa_id = auth_empresa_id())
  with check (es_admin() and empresa_id = auth_empresa_id());

-- entregas -------------------------------------------------------------
create policy entrega_lectura on entregas for select
  using (empresa_id = auth_empresa_id()
         and auth_rol() in ('admin_kidotoy','admin_dev','empresa_cliente','operario_entrega'));
create policy entrega_registro on entregas for insert
  with check (empresa_id = auth_empresa_id()
              and auth_rol() in ('operario_entrega','admin_kidotoy','admin_dev'));

-- carpas ---------------------------------------------------------------
create policy carpa_lectura on carpas for select
  using (empresa_id = auth_empresa_id()
         and auth_rol() in ('admin_kidotoy','admin_dev','empresa_cliente','operario_entrega'));
create policy carpa_admin on carpas for all
  using (es_admin() and empresa_id = auth_empresa_id())
  with check (es_admin() and empresa_id = auth_empresa_id());

-- carpa_referencias ----------------------------------------------------
create policy carpa_ref_lectura on carpa_referencias for select
  using (empresa_id = auth_empresa_id()
         and auth_rol() in ('admin_kidotoy','admin_dev','empresa_cliente','operario_entrega'));
create policy carpa_ref_admin on carpa_referencias for all
  using (es_admin() and empresa_id = auth_empresa_id())
  with check (es_admin() and empresa_id = auth_empresa_id());

-- operarios ------------------------------------------------------------
-- El operario lee su propia fila (para saber su carpa). El admin gestiona todo.
create policy operario_propio on operarios for select
  using (auth_user_id = auth.uid());
create policy operario_gestion on operarios for select
  using (es_admin() and empresa_id = auth_empresa_id());
create policy operario_admin on operarios for all
  using (es_admin() and empresa_id = auth_empresa_id())
  with check (es_admin() and empresa_id = auth_empresa_id());

-- auditoría ------------------------------------------------------------
create policy audit_lectura on auditoria for select
  using (es_admin() and empresa_id = auth_empresa_id());

-- intentos de acceso ---------------------------------------------------
create policy intentos_lectura on intentos_acceso for select
  using (es_admin());
