-- Anyone who knows a phone number and service attaches to that lead, so a later
-- session must never overwrite what is saved. Each session that attaches gets the
-- next submission number, and its answers are stored as that version. Portal
-- screens read lead_steps_latest; lead_steps keeps the full history.
-- To reverse: drop the view and columns, then restore both functions from
-- 20261102090200_lead_capture_functions.sql.

alter table public.leads
  add column submission_count integer not null default 1 check (submission_count > 0);

alter table public.lead_steps
  add column version integer not null default 1 check (version > 0),
  drop constraint lead_steps_lead_id_step_index_key,
  add constraint lead_steps_lead_step_version_key unique (lead_id, step_index, version);

create view public.lead_steps_latest
with (security_invoker = true)
as
select distinct on (s.lead_id, s.step_index) s.*
from public.lead_steps s
order by s.lead_id, s.step_index, s.version desc;

grant select on public.lead_steps_latest to authenticated, service_role;

drop function public.create_or_attach_lead(text, text, text, text, integer, integer, text, text, text, text, text);
drop function public.save_lead_step(uuid, integer, text, jsonb, text, text, text, text, text, text);

-- p_session_lead and p_session_submission come from the visitor's signed cookie.
-- The same session submitting again keeps its own version; anyone else, or the
-- same person after the cookie expired, gets a new one.
create function public.create_or_attach_lead(
  p_service text,
  p_full_name text,
  p_whatsapp text,
  p_best_time text,
  p_steps_total integer,
  p_form_version integer,
  p_source_page text default null,
  p_referrer text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_session_lead uuid default null,
  p_session_submission integer default null
)
returns table (lead_id uuid, ref text, is_new boolean, submission integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing uuid;
  next_submission integer;
  new_id uuid;
  new_ref text;
  owner public.staff%rowtype;
  service_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_whatsapp || '|' || p_service, 0));

  existing := public.find_duplicate_lead(p_whatsapp, p_service);

  if existing is not null then
    if existing = p_session_lead and p_session_submission is not null then
      return query
        select l.id, l.ref, false, p_session_submission
        from public.leads l where l.id = existing;
      return;
    end if;

    update public.leads l
    set submission_count = l.submission_count + 1
    where l.id = existing
    returning l.submission_count into next_submission;

    insert into public.lead_events (lead_id, type, data)
    values (
      existing, 'resubmitted',
      jsonb_build_object('submission', next_submission, 'full_name', p_full_name)
    );

    return query
      select l.id, l.ref, false, next_submission
      from public.leads l where l.id = existing;
    return;
  end if;

  select s.name into strict service_name
  from public.services s
  where s.key = p_service;

  select st.* into owner
  from public.services s
  join public.staff st on st.id = s.owner_id and st.is_active
  where s.key = p_service;

  new_ref := public.next_lead_ref(p_service);

  insert into public.leads (
    ref, service_key, full_name, whatsapp, best_time, consent_at, status, owner_id,
    steps_total, form_version, source_page, referrer, utm_source, utm_medium, utm_campaign
  )
  values (
    new_ref, p_service, p_full_name, p_whatsapp, p_best_time, now(), 'new', owner.id,
    p_steps_total, p_form_version, p_source_page, p_referrer, p_utm_source, p_utm_medium, p_utm_campaign
  )
  returning id into new_id;

  -- Enqueued, not sent: a provider outage must never cost a lead.
  insert into public.notifications (lead_id, channel, to_address, template, payload, idempotency_key)
  values (
    new_id, 'sms', p_whatsapp, 'sms.lead_ack',
    jsonb_build_object(
      'ref', new_ref,
      'first_name', split_part(p_full_name, ' ', 1),
      'owner_first_name', split_part(owner.full_name, ' ', 1)
    ),
    'lead:' || new_id || ':sms.lead_ack:v1'
  );

  -- With no owner the lead waits in the inbox, unassigned (F-10). The short delay
  -- lets step 1's answers save first, because the email shows them.
  if owner.id is not null then
    insert into public.notifications (lead_id, channel, to_address, template, payload, idempotency_key, send_after)
    values (
      new_id, 'email', owner.email, 'email.owner_new_lead',
      jsonb_build_object('ref', new_ref, 'owner_first_name', split_part(owner.full_name, ' ', 1)),
      'lead:' || new_id || ':email.owner_new_lead:v1',
      now() + interval '5 seconds'
    );
  end if;

  return query select new_id, new_ref, true, 1;
end;
$$;

-- Saving a step again within a submission replaces that version only. Attribution
-- only fills gaps, so the first touch is kept; a later submission cannot replace
-- the original answer to heard_from either.
create function public.save_lead_step(
  p_lead_id uuid,
  p_step_index integer,
  p_step_key text,
  p_answers jsonb,
  p_heard_from text default null,
  p_source_page text default null,
  p_referrer text default null,
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_submission integer default 1
)
returns table (steps_completed integer, steps_total integer, is_partial boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  lead public.leads%rowtype;
  completed integer;
begin
  select l.* into strict lead from public.leads l where l.id = p_lead_id for update;

  if p_step_index < 0 or p_step_index >= lead.steps_total then
    raise exception 'Step % is outside this form', p_step_index
      using errcode = '22023';
  end if;

  if p_submission < 1 or p_submission > lead.submission_count then
    raise exception 'Submission % does not exist on this lead', p_submission
      using errcode = '22023';
  end if;

  insert into public.lead_steps (lead_id, step_index, step_key, answers, saved_at, version)
  values (p_lead_id, p_step_index, p_step_key, p_answers, now(), p_submission)
  on conflict (lead_id, step_index, version) do update
    set step_key = excluded.step_key, answers = excluded.answers, saved_at = excluded.saved_at;

  completed := greatest(lead.steps_completed, p_step_index + 1);

  update public.leads l
  set steps_completed = completed,
    is_partial = completed < lead.steps_total,
    heard_from = case
      when p_submission = 1 then coalesce(p_heard_from, l.heard_from)
      else coalesce(l.heard_from, p_heard_from)
    end,
    source_page = coalesce(l.source_page, p_source_page),
    referrer = coalesce(l.referrer, p_referrer),
    utm_source = coalesce(l.utm_source, p_utm_source),
    utm_medium = coalesce(l.utm_medium, p_utm_medium),
    utm_campaign = coalesce(l.utm_campaign, p_utm_campaign)
  where l.id = p_lead_id;

  insert into public.lead_events (lead_id, type, data)
  values (
    p_lead_id, 'step_saved',
    jsonb_build_object('step_index', p_step_index, 'step_key', p_step_key, 'version', p_submission)
  );

  if completed = lead.steps_total and lead.steps_completed < lead.steps_total then
    insert into public.lead_events (lead_id, type) values (p_lead_id, 'completed');
  end if;

  return query select completed, lead.steps_total, completed < lead.steps_total;
end;
$$;

revoke execute on function public.create_or_attach_lead(text, text, text, text, integer, integer, text, text, text, text, text, uuid, integer)
  from public, anon, authenticated;
revoke execute on function public.save_lead_step(uuid, integer, text, jsonb, text, text, text, text, text, text, integer)
  from public, anon, authenticated;

grant execute on function public.create_or_attach_lead(text, text, text, text, integer, integer, text, text, text, text, text, uuid, integer)
  to service_role;
grant execute on function public.save_lead_step(uuid, integer, text, jsonb, text, text, text, text, text, text, integer)
  to service_role;
