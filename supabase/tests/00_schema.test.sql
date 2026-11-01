begin;
select * from no_plan();

select is(
  (select count(*)::int from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relkind = 'r'),
  25,
  'the public schema has the 25 tables from the Data Model'
);

select is_empty(
  $$ select c.relname from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity $$,
  'every table has RLS enabled'
);

select is_empty(
  $$ select c.relname from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind = 'v'
       and not coalesce(c.reloptions @> array['security_invoker=true'], false) $$,
  'every view uses security_invoker'
);

select is_empty(
  $$ select con.conrelid::regclass::text, con.conname
     from pg_constraint con
     join pg_namespace n on n.oid = con.connamespace
     where n.nspname = 'public' and con.contype = 'f'
       and not exists (
         select 1 from pg_index i
         where i.indrelid = con.conrelid
           and (i.indkey::int2[])[0:cardinality(con.conkey) - 1] = con.conkey
       ) $$,
  'every foreign key is indexed'
);

select is_empty(
  $$ select p.proname from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prosecdef
       and not coalesce(p.proconfig::text like '%search_path=%', false) $$,
  'every security definer function has a fixed search_path'
);

select has_trigger(t, t || '_audit', t || ' writes to audit_log')
from unnest(array[
  'scholarships', 'posts', 'videos', 'video_placements', 'programmes', 'openings',
  'drives', 'trips', 'faqs', 'testimonials', 'content_comments', 'settings', 'prices',
  'live_schedule', 'services', 'staff', 'staff_content_access', 'leads'
]) as t;

select results_eq(
  $$ select id, public from storage.buckets order by id $$,
  $$ values ('draft-images'::text, false), ('public-images'::text, true) $$,
  'draft-images is private and public-images is public'
);

select * from finish();
rollback;
