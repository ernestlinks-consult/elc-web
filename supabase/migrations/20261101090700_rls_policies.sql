-- Policies matching "Access rules (row-level security)" in the Data Model.
-- RLS is already enabled on every table. Server actions use the service role,
-- which bypasses these policies; nothing here lets a visitor write.
-- To reverse: drop these policies (tables then deny everything).

-- Published content -------------------------------------------------------
-- Everyone reads published rows. Editors with the content type and admins read
-- and write the rest. Posts, openings and programmes need an admin to publish.

create policy scholarships_read_published on public.scholarships
  for select to anon, authenticated
  using (publish_state = 'published');
create policy scholarships_write on public.scholarships
  for all to authenticated
  using (public.is_admin() or public.has_content_access('scholarship'))
  with check (public.is_admin() or public.has_content_access('scholarship'));

create policy posts_read_published on public.posts
  for select to anon, authenticated
  using (publish_state = 'published');
create policy posts_write on public.posts
  for all to authenticated
  using (public.is_admin() or public.has_content_access('post'))
  with check (public.is_admin() or (public.has_content_access('post') and publish_state <> 'published'));

create policy videos_read_published on public.videos
  for select to anon, authenticated
  using (publish_state = 'published');
create policy videos_write on public.videos
  for all to authenticated
  using (public.is_admin() or public.has_content_access('video'))
  with check (public.is_admin() or public.has_content_access('video'));

create policy video_placements_read_published on public.video_placements
  for select to anon, authenticated
  using (exists (
    select 1 from public.videos v
    where v.id = video_id and v.publish_state = 'published'
  ));
create policy video_placements_write on public.video_placements
  for all to authenticated
  using (public.is_admin() or public.has_content_access('video'))
  with check (public.is_admin() or public.has_content_access('video'));

-- Signed-in users outside active staff get nothing, because authenticated holds
-- the whole table including internal_school_name.
create policy programmes_read_published_anon on public.programmes
  for select to anon
  using (publish_state = 'published');
create policy programmes_read_published_staff on public.programmes
  for select to authenticated
  using (publish_state = 'published' and public.staff_role() is not null);
create policy programmes_write on public.programmes
  for all to authenticated
  using (public.is_admin() or public.has_content_access('programme'))
  with check (public.is_admin() or (public.has_content_access('programme') and publish_state <> 'published'));

create policy openings_read_published on public.openings
  for select to anon, authenticated
  using (publish_state = 'published');
create policy openings_write on public.openings
  for all to authenticated
  using (public.is_admin() or public.has_content_access('opening'))
  with check (public.is_admin() or (public.has_content_access('opening') and publish_state <> 'published'));

create policy drives_read_published on public.drives
  for select to anon, authenticated
  using (publish_state = 'published');
create policy drives_write on public.drives
  for all to authenticated
  using (public.is_admin() or public.has_content_access('drive'))
  with check (public.is_admin() or public.has_content_access('drive'));

create policy trips_read_published on public.trips
  for select to anon, authenticated
  using (publish_state = 'published');
create policy trips_write on public.trips
  for all to authenticated
  using (public.is_admin() or public.has_content_access('trip'))
  with check (public.is_admin() or public.has_content_access('trip'));

create policy faqs_read_published on public.faqs
  for select to anon, authenticated
  using (publish_state = 'published');
create policy faqs_write on public.faqs
  for all to authenticated
  using (public.is_admin() or public.has_content_access('faq'))
  with check (public.is_admin() or public.has_content_access('faq'));

create policy testimonials_read_published on public.testimonials
  for select to anon, authenticated
  using (publish_state = 'published');
create policy testimonials_write on public.testimonials
  for all to authenticated
  using (public.is_admin() or public.has_content_access('testimonial'))
  with check (public.is_admin() or public.has_content_access('testimonial'));

-- Review comments follow the content type they sit on. Front desk gets none.
create policy content_comments_access on public.content_comments
  for select to authenticated
  using (public.is_admin() or public.has_content_access(content_type));
create policy content_comments_insert on public.content_comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and (public.is_admin() or public.has_content_access(content_type))
  );
create policy content_comments_update on public.content_comments
  for update to authenticated
  using (public.is_admin() or public.has_content_access(content_type))
  with check (public.is_admin() or public.has_content_access(content_type));
create policy content_comments_delete on public.content_comments
  for delete to authenticated
  using (public.is_admin());

-- Leads -------------------------------------------------------------------
-- Front desk reads all and updates status, owner and notes; a trigger in the
-- lead timeline migration holds it to those columns. Editors read and update
-- the leads they own.

create policy leads_admin on public.leads
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy leads_front_desk_read on public.leads
  for select to authenticated
  using (public.staff_role() = 'front_desk');
create policy leads_front_desk_update on public.leads
  for update to authenticated
  using (public.staff_role() = 'front_desk')
  with check (public.staff_role() = 'front_desk');
create policy leads_editor_read on public.leads
  for select to authenticated
  using (public.staff_role() = 'editor' and owner_id = auth.uid());
create policy leads_editor_update on public.leads
  for update to authenticated
  using (public.staff_role() = 'editor' and owner_id = auth.uid())
  with check (public.staff_role() = 'editor' and owner_id = auth.uid());

-- lead_id in (select ... leads) applies the leads policies above.
create policy lead_steps_admin on public.lead_steps
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy lead_steps_read on public.lead_steps
  for select to authenticated
  using (lead_id in (select l.id from public.leads l));

create policy lead_events_admin on public.lead_events
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy lead_events_read on public.lead_events
  for select to authenticated
  using (lead_id in (select l.id from public.leads l));
create policy lead_events_add_note on public.lead_events
  for insert to authenticated
  with check (
    type = 'note'
    and actor_id = auth.uid()
    and lead_id in (select l.id from public.leads l)
  );

-- Outbox: written by the service role; admins can read it for support.
create policy notifications_admin_read on public.notifications
  for select to authenticated
  using (public.is_admin());

-- Messages and subscribers ------------------------------------------------

create policy messages_admin on public.messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy messages_front_desk_read on public.messages
  for select to authenticated
  using (public.staff_role() = 'front_desk');
create policy messages_front_desk_update on public.messages
  for update to authenticated
  using (public.staff_role() = 'front_desk')
  with check (public.staff_role() = 'front_desk');

create policy subscribers_admin on public.subscribers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
create policy subscribers_front_desk_read on public.subscribers
  for select to authenticated
  using (public.staff_role() = 'front_desk');
create policy subscribers_front_desk_update on public.subscribers
  for update to authenticated
  using (public.staff_role() = 'front_desk')
  with check (public.staff_role() = 'front_desk');

-- Prices, settings, LIVE schedule, services -------------------------------
-- Visitors see public rows through the views; staff read all; admins write.

create policy prices_read_public on public.prices
  for select to anon
  using (is_public and not never_public);
create policy prices_read_staff on public.prices
  for select to authenticated
  using (public.staff_role() is not null);
create policy prices_admin_write on public.prices
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy settings_read_public on public.settings
  for select to anon
  using (key in (
    'contacts', 'hours', 'reply_promise', 'booking_url', 'offices', 'socials', 'live_note'
  ));
create policy settings_read_staff on public.settings
  for select to authenticated
  using (public.staff_role() is not null);
create policy settings_admin_write on public.settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy live_schedule_read_public on public.live_schedule
  for select to anon
  using (true);
create policy live_schedule_read_staff on public.live_schedule
  for select to authenticated
  using (public.staff_role() is not null);
create policy live_schedule_admin_write on public.live_schedule
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy services_read_public on public.services
  for select to anon
  using (true);
create policy services_read_staff on public.services
  for select to authenticated
  using (public.staff_role() is not null);
create policy services_admin_write on public.services
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Staff -------------------------------------------------------------------
-- Disabled staff and other signed-in users get nothing: authenticated holds
-- email and phone, so its read policy must not be the public one.

create policy staff_read_public on public.staff
  for select to anon
  using (show_on_site and is_active);
create policy staff_read_staff on public.staff
  for select to authenticated
  using (public.staff_role() is not null);
create policy staff_admin_write on public.staff
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy staff_content_access_read on public.staff_content_access
  for select to authenticated
  using (public.staff_role() is not null);
create policy staff_content_access_admin_write on public.staff_content_access
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Logs --------------------------------------------------------------------

create policy audit_log_admin_read on public.audit_log
  for select to authenticated
  using (public.is_admin());

create policy events_admin_read on public.events
  for select to authenticated
  using (public.is_admin());
