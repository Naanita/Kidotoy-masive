-- =====================================================================
--  05-storage.sql — Bucket de fotos del catálogo.
--
--  Se aplica después del esquema y antes (o después) del seed: no depende
--  de ninguna tabla del proyecto, solo del esquema `storage` de Supabase.
--
--  Reejecutable: el bucket va con `on conflict` y las políticas con
--  `drop policy if exists`, así que correrlo dos veces deja el mismo estado.
-- =====================================================================

-- ---------------------------------------------------------------- bucket
--  `public = true` es lo que hace que <img src="…/object/public/catalogo/…">
--  cargue SIN sesión y sin cabecera de autorización. Con el bucket privado
--  habría que firmar cada URL, y estas fotos las ve gente sin sesión (y las
--  cachea el navegador un año).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalogo',
  'catalogo',
  true,
  2097152, -- 2 MB por objeto: las fotos optimizadas pesan ~40-90 KB
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------- lectura
--  Política de LECTURA anónima EXPLÍCITA, acotada a este bucket. Aunque el
--  bucket público ya sirve por la ruta /object/public, la política deja la
--  intención escrita en la base y cubre la ruta autenticada.
drop policy if exists "catalogo lectura publica" on storage.objects;
create policy "catalogo lectura publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'catalogo');

-- ---------------------------------------------------------------- escritura
--  NO hay políticas de insert/update/delete a propósito. Sin política, RLS
--  niega: ni anon ni un colaborador autenticado pueden subir, reemplazar ni
--  borrar. El único que escribe es el rol de servicio, que se salta RLS y
--  solo vive en el script local `scripts/catalogo-imagenes.mjs`.
--
--  Si algún día hiciera falta que Kidotoy suba fotos desde /kidotoy, la
--  política iría aquí acotada al rol admin_kidotoy, nunca abierta.
drop policy if exists "catalogo escritura" on storage.objects;
