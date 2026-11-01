-- Table privileges. Supabase grants everything to anon and authenticated by
-- default and leaves the rest to RLS. Here privileges come first: anon gets
-- SELECT only, and never on a private column. Column lists matter because RLS
-- filters rows, not columns.
-- To reverse: grant all on all tables in schema public to anon, authenticated.

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Visitors: published content, and only the public columns of three tables.
grant select on
  public.scholarships,
  public.posts,
  public.videos,
  public.video_placements,
  public.openings,
  public.drives,
  public.trips,
  public.faqs,
  public.testimonials,
  public.prices,
  public.settings,
  public.live_schedule
to anon;

-- No internal_school_name (house rule 2).
grant select (
  id, kind, country, city, level, title, duration_text, tuition_text, keyword,
  correct_as_of, publish_state, owner_id, created_at, updated_at
) on public.programmes to anon;

-- No owner_id: who owns a service is a staff matter.
grant select (
  key, name, slug, ref_prefix, whatsapp_keyword, short_description, sort_order,
  created_at, updated_at
) on public.services to anon;

-- No email or phone.
grant select (
  id, full_name, title, photo_path, bio, sort_order, show_on_site, is_active
) on public.staff to anon;

grant select on
  public.scholarships_public,
  public.prices_public,
  public.staff_public,
  public.settings_public,
  public.live_schedule_public
to anon, authenticated;

-- Staff: privileges are wide because RLS decides per role. The two logs and the
-- notification outbox are written only by triggers and the service role.
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.audit_log, public.events, public.notifications from authenticated;
