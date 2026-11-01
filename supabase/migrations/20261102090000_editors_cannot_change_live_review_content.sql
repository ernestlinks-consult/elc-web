-- Posts, openings and programmes go through admin review, so once one is live
-- only an admin may change, unpublish, archive or delete it.
-- To reverse: drop the policies below and recreate the *_write policies from
-- 20261101090700_rls_policies.sql.

-- TODO(phase 2): revision drafts, so editors can propose changes to live content
-- and send them through review without touching the published row.

drop policy posts_write on public.posts;
drop policy openings_write on public.openings;
drop policy programmes_write on public.programmes;

create policy posts_admin on public.posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy posts_editor_read on public.posts
  for select to authenticated
  using (public.has_content_access('post'));
create policy posts_editor_insert on public.posts
  for insert to authenticated
  with check (public.has_content_access('post') and publish_state <> 'published');
create policy posts_editor_update on public.posts
  for update to authenticated
  using (public.has_content_access('post') and publish_state <> 'published')
  with check (public.has_content_access('post') and publish_state <> 'published');
create policy posts_editor_delete on public.posts
  for delete to authenticated
  using (public.has_content_access('post') and publish_state <> 'published');

create policy openings_admin on public.openings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy openings_editor_read on public.openings
  for select to authenticated
  using (public.has_content_access('opening'));
create policy openings_editor_insert on public.openings
  for insert to authenticated
  with check (public.has_content_access('opening') and publish_state <> 'published');
create policy openings_editor_update on public.openings
  for update to authenticated
  using (public.has_content_access('opening') and publish_state <> 'published')
  with check (public.has_content_access('opening') and publish_state <> 'published');
create policy openings_editor_delete on public.openings
  for delete to authenticated
  using (public.has_content_access('opening') and publish_state <> 'published');

create policy programmes_admin on public.programmes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy programmes_editor_read on public.programmes
  for select to authenticated
  using (public.has_content_access('programme'));
create policy programmes_editor_insert on public.programmes
  for insert to authenticated
  with check (public.has_content_access('programme') and publish_state <> 'published');
create policy programmes_editor_update on public.programmes
  for update to authenticated
  using (public.has_content_access('programme') and publish_state <> 'published')
  with check (public.has_content_access('programme') and publish_state <> 'published');
create policy programmes_editor_delete on public.programmes
  for delete to authenticated
  using (public.has_content_access('programme') and publish_state <> 'published');
