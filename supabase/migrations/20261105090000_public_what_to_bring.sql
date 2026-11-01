-- The passport page's "what to bring" list is content ELC will edit, and public.
-- To reverse: restore the key list from 20261101090500 and 20261101090700.

create or replace view public.settings_public
with (security_invoker = true)
as
select s.key, s.value
from public.settings s
where s.key in (
  'contacts', 'hours', 'reply_promise', 'booking_url', 'offices', 'socials', 'live_note',
  'passport_what_to_bring'
);

drop policy settings_read_public on public.settings;

create policy settings_read_public on public.settings
  for select to anon
  using (key in (
    'contacts', 'hours', 'reply_promise', 'booking_url', 'offices', 'socials', 'live_note',
    'passport_what_to_bring'
  ));
