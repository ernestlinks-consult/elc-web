-- Calls the send-notifications Edge Function every minute. The function's URL and
-- shared secret live in Vault, per environment, never in a migration:
--
--   select vault.create_secret('https://<project>.functions.supabase.co/send-notifications', 'notify_function_url');
--   select vault.create_secret('<same value as NOTIFY_CRON_SECRET>', 'notify_cron_secret');
--
-- With neither set the job does nothing, so a local database never sends on its
-- own: locally, run `npm run notify:run`.
-- To reverse: select cron.unschedule('send-notifications'), then drop the function.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create function public.trigger_send_notifications()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  function_url text := (select s.decrypted_secret from vault.decrypted_secrets s where s.name = 'notify_function_url');
  cron_secret text := (select s.decrypted_secret from vault.decrypted_secrets s where s.name = 'notify_cron_secret');
begin
  if function_url is null or cron_secret is null then
    return;
  end if;

  perform net.http_post(
    url := function_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', cron_secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
end;
$$;

revoke execute on function public.trigger_send_notifications() from public, anon, authenticated;

select cron.schedule(
  'send-notifications',
  '* * * * *',
  $$ select public.trigger_send_notifications() $$
);
