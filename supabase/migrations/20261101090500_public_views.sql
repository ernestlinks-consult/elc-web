-- Public read models. security_invoker means each view runs with the reader's
-- own grants and RLS policies, so a view can never show more than its base
-- table's policy allows.
-- To reverse: drop these views.

-- Status is computed from dates in Africa/Accra (Key SQL).
create view public.scholarships_public
with (security_invoker = true)
as
select s.*,
  case
    when s.deadline_on is not null and s.deadline_on < (now() at time zone 'Africa/Accra')::date then 'closed'
    when s.opens_on is not null and s.opens_on > (now() at time zone 'Africa/Accra')::date then 'opening_soon'
    else 'open'
  end as status
from public.scholarships s
where s.publish_state = 'published' and s.official_url is not null and s.not_pay_to_apply;

create view public.prices_public
with (security_invoker = true)
as
select p.key, p.label, p.amount_ghs, p.time_text, p.shown_on
from public.prices p
where p.is_public and not p.never_public;

create view public.staff_public
with (security_invoker = true)
as
select s.id, s.full_name, s.title, s.photo_path, s.bio, s.sort_order
from public.staff s
where s.show_on_site and s.is_active;

create view public.settings_public
with (security_invoker = true)
as
select s.key, s.value
from public.settings s
where s.key in (
  'contacts', 'hours', 'reply_promise', 'booking_url', 'offices', 'socials', 'live_note'
);

-- Not in the Data Model's list, but the access rules say visitors read the LIVE
-- schedule through a view, and the homepage needs the host's name.
create view public.live_schedule_public
with (security_invoker = true)
as
select l.weekday, l.topic, l.starts_at_time, l.ends_at_time, s.full_name as host_name
from public.live_schedule l
left join public.staff_public s on s.id = l.host_id;
