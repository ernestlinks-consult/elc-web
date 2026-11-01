-- Image buckets. public-images holds published images, readable by anyone.
-- draft-images holds work in progress, visible to staff only. Front desk has no
-- content editing, so only editors and admins upload.
-- To reverse: drop these policies and delete both buckets.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-images', 'public-images', true, 5242880, array['image/webp', 'image/avif', 'image/jpeg', 'image/png']),
  ('draft-images', 'draft-images', false, 5242880, array['image/webp', 'image/avif', 'image/jpeg', 'image/png']);

create policy public_images_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'public-images');
create policy public_images_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-images' and public.staff_role() in ('admin', 'editor'));
create policy public_images_update on storage.objects
  for update to authenticated
  using (bucket_id = 'public-images' and public.staff_role() in ('admin', 'editor'))
  with check (bucket_id = 'public-images' and public.staff_role() in ('admin', 'editor'));
create policy public_images_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-images' and public.staff_role() in ('admin', 'editor'));

create policy draft_images_read on storage.objects
  for select to authenticated
  using (bucket_id = 'draft-images' and public.staff_role() is not null);
create policy draft_images_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'draft-images' and public.staff_role() in ('admin', 'editor'));
create policy draft_images_update on storage.objects
  for update to authenticated
  using (bucket_id = 'draft-images' and public.staff_role() in ('admin', 'editor'))
  with check (bucket_id = 'draft-images' and public.staff_role() in ('admin', 'editor'));
create policy draft_images_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'draft-images' and public.staff_role() in ('admin', 'editor'));
