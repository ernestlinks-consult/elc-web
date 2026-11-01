-- Groundwork for Scholarship Hunt alerts, which are not sent yet. Any future
-- sender must read subscribers_active, never subscribers, so an unsubscribed
-- number cannot be messaged.
--
-- TODO(alerts): the STOP keyword flow. An inbound webhook from the SMS or WhatsApp
-- provider (app/api/webhooks/sms) receives the reply, checks its signature, sees
-- STOP as the whole message (any case), and calls lib/leads/subscribers.ts
-- unsubscribe() with the sender's number. It then confirms once and never messages
-- that number again unless they sign up afresh, which clears unsubscribed_at.
--
-- To reverse: drop the view and the function.

create view public.subscribers_active
with (security_invoker = true)
as
select s.id, s.whatsapp, s.list, s.consent_at
from public.subscribers s
where s.unsubscribed_at is null;

grant select on public.subscribers_active to authenticated, service_role;

-- Returns true if a subscribed number was found. Unsubscribing twice keeps the
-- first date.
create function public.unsubscribe(p_whatsapp text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.subscribers s
  set unsubscribed_at = now()
  where s.whatsapp = p_whatsapp and s.unsubscribed_at is null;

  return found;
end;
$$;

revoke execute on function public.unsubscribe(text) from public, anon, authenticated;
grant execute on function public.unsubscribe(text) to service_role;
