-- F-11: the outbox worker's database side. Claiming marks a row 'sending' and
-- commits, so two workers can never hold the same row, and idempotency_key means
-- the same notification cannot even be queued twice.
-- To reverse: drop these functions and the trigger, then the three new columns.

alter table public.notifications
  add column idempotency_key text,
  add column provider_id text,
  add column claimed_at timestamptz;

update public.notifications
set idempotency_key = coalesce(lead_id::text, id::text) || ':' || template || ':v1'
where idempotency_key is null;

alter table public.notifications
  alter column idempotency_key set not null,
  add constraint notifications_idempotency_key_key unique (idempotency_key);

-- A row still 'sending' after 10 minutes means the worker died part way, perhaps
-- after the provider accepted it. Sending again could send twice, so it is marked
-- failed for a person to check.
create function public.claim_notifications(p_limit integer default 20)
returns setof public.notifications
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notifications n
  set status = 'failed',
    last_error = 'Worker stopped while sending. Not retried, to avoid a duplicate.'
  where n.status = 'sending' and n.claimed_at < now() - interval '10 minutes';

  return query
    with due as (
      select n.id
      from public.notifications n
      where n.status = 'pending' and n.send_after <= now()
      order by n.send_after, n.created_at
      limit p_limit
      for update skip locked
    )
    update public.notifications n
    set status = 'sending', claimed_at = now()
    from due
    where n.id = due.id
    returning n.*;
end;
$$;

-- Only a row this worker holds can be marked, so a repeat call does nothing.
create function public.record_notification_sent(p_id uuid, p_provider_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  row public.notifications%rowtype;
begin
  update public.notifications n
  set status = 'sent', sent_at = now(), provider_id = p_provider_id,
    attempts = n.attempts + 1, last_error = null
  where n.id = p_id and n.status = 'sending'
  returning n.* into row;

  if not found then
    return false;
  end if;

  if row.lead_id is not null then
    insert into public.lead_events (lead_id, type, data)
    values (
      row.lead_id,
      case when row.channel = 'sms' then 'sms_sent' else 'email_sent' end::public.lead_event_type,
      jsonb_build_object('template', row.template, 'provider_id', p_provider_id)
    );
  end if;

  return true;
end;
$$;

-- p_retry_minutes comes from the worker. Null means do not retry. The cap on
-- attempts lives here so no caller can retry forever. When the lead's SMS fails
-- for good, the owner is told in a follow-up email.
create function public.record_notification_failure(
  p_id uuid,
  p_error text,
  p_retry_minutes integer default null
)
returns public.notify_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  row public.notifications%rowtype;
  give_up boolean;
  lead_ref text;
  owner_email text;
  owner_name text;
begin
  select n.* into row
  from public.notifications n
  where n.id = p_id and n.status = 'sending'
  for update;

  if not found then
    return null;
  end if;

  give_up := row.attempts + 1 >= 6 or p_retry_minutes is null;

  update public.notifications n
  set attempts = n.attempts + 1,
    last_error = left(p_error, 500),
    status = case when give_up then 'failed' else 'pending' end::public.notify_status,
    send_after = case
      when give_up then n.send_after
      else now() + make_interval(mins => p_retry_minutes)
    end
  where n.id = p_id;

  if give_up and row.template = 'sms.lead_ack' and row.lead_id is not null then
    select l.ref, s.email, split_part(s.full_name, ' ', 1)
    into lead_ref, owner_email, owner_name
    from public.leads l
    join public.staff s on s.id = l.owner_id and s.is_active
    where l.id = row.lead_id;

    if owner_email is not null then
      insert into public.notifications (lead_id, channel, to_address, template, payload, idempotency_key)
      values (
        row.lead_id, 'email', owner_email, 'email.owner_sms_failed',
        jsonb_build_object('ref', lead_ref, 'owner_first_name', owner_name),
        'lead:' || row.lead_id || ':email.owner_sms_failed:v1'
      )
      on conflict (idempotency_key) do nothing;
    end if;
  end if;

  return case when give_up then 'failed' else 'pending' end::public.notify_status;
end;
$$;

-- Contact form messages go to the front-desk address in settings.
create function public.messages_enqueue_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  front_desk text := (select s.value #>> '{}' from public.settings s where s.key = 'front_desk_email');
begin
  if front_desk is null then
    return null;
  end if;

  insert into public.notifications (channel, to_address, template, payload, idempotency_key)
  values (
    'email', front_desk, 'email.message_received',
    jsonb_build_object(
      'message_id', new.id,
      'full_name', new.full_name,
      'whatsapp', new.whatsapp,
      'email', new.email,
      'topic', new.topic,
      'body', new.body
    ),
    'message:' || new.id || ':email.message_received:v1'
  );

  return null;
end;
$$;

create trigger messages_enqueue_notification after insert on public.messages
  for each row execute function public.messages_enqueue_notification();

revoke execute on function public.claim_notifications(integer) from public, anon, authenticated;
revoke execute on function public.record_notification_sent(uuid, text) from public, anon, authenticated;
revoke execute on function public.record_notification_failure(uuid, text, integer) from public, anon, authenticated;
revoke execute on function public.messages_enqueue_notification() from public, anon, authenticated;

grant execute on function public.claim_notifications(integer) to service_role;
grant execute on function public.record_notification_sent(uuid, text) to service_role;
grant execute on function public.record_notification_failure(uuid, text, integer) to service_role;
