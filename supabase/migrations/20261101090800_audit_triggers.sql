-- P-14: one generic trigger writes every change to audit_log. Attached to all
-- content, settings, prices, staff, services and leads tables.
-- To reverse: drop the triggers, then public.audit_row().

-- Trigger arguments name the key columns; with none, the key is "id".
create function public.audit_row()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  after_row jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  source_row jsonb := coalesce(after_row, before_row);
  key_columns text[] := coalesce(tg_argv::text[], '{}');
begin
  if tg_op = 'UPDATE' and before_row - 'updated_at' = after_row - 'updated_at' then
    return null;
  end if;

  if cardinality(key_columns) = 0 then
    key_columns := array['id'];
  end if;

  insert into public.audit_log (actor_id, action, table_name, row_id, before, after)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    (select string_agg(source_row ->> column_name, '/') from unnest(key_columns) as column_name),
    before_row,
    after_row
  );

  return null;
end;
$$;

revoke execute on function public.audit_row() from public, anon, authenticated;

create trigger scholarships_audit after insert or update or delete on public.scholarships
  for each row execute function public.audit_row();
create trigger posts_audit after insert or update or delete on public.posts
  for each row execute function public.audit_row();
create trigger videos_audit after insert or update or delete on public.videos
  for each row execute function public.audit_row();
create trigger video_placements_audit after insert or update or delete on public.video_placements
  for each row execute function public.audit_row('video_id', 'page_key');
create trigger programmes_audit after insert or update or delete on public.programmes
  for each row execute function public.audit_row();
create trigger openings_audit after insert or update or delete on public.openings
  for each row execute function public.audit_row();
create trigger drives_audit after insert or update or delete on public.drives
  for each row execute function public.audit_row();
create trigger trips_audit after insert or update or delete on public.trips
  for each row execute function public.audit_row();
create trigger faqs_audit after insert or update or delete on public.faqs
  for each row execute function public.audit_row();
create trigger testimonials_audit after insert or update or delete on public.testimonials
  for each row execute function public.audit_row();
create trigger content_comments_audit after insert or update or delete on public.content_comments
  for each row execute function public.audit_row();

create trigger settings_audit after insert or update or delete on public.settings
  for each row execute function public.audit_row('key');
create trigger prices_audit after insert or update or delete on public.prices
  for each row execute function public.audit_row('key');
create trigger live_schedule_audit after insert or update or delete on public.live_schedule
  for each row execute function public.audit_row('weekday');
create trigger services_audit after insert or update or delete on public.services
  for each row execute function public.audit_row('key');

create trigger staff_audit after insert or update or delete on public.staff
  for each row execute function public.audit_row();
create trigger staff_content_access_audit after insert or update or delete on public.staff_content_access
  for each row execute function public.audit_row('staff_id', 'content_type');

create trigger leads_audit after insert or update or delete on public.leads
  for each row execute function public.audit_row();
