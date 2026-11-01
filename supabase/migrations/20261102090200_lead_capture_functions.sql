-- F-02, F-03, F-10, F-11, F-12: the only ways a public form writes a lead. Both
-- are for the service role, called from server actions after Zod validation.
-- To reverse: drop public.create_or_attach_lead and public.save_lead_step.

-- The advisory lock makes the duplicate check and insert one step, so a double
-- submit cannot create two leads. Returns the lead either way.
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
  p_utm_campaign text default null
)
returns table (lead_id uuid, ref text, is_new boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing uuid;
  new_id uuid;
  new_ref text;
  owner public.staff%rowtype;
  service_name text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_whatsapp || '|' || p_service, 0));

  existing := public.find_duplicate_lead(p_whatsapp, p_service);

  if existing is not null then
    insert into public.lead_events (lead_id, type, data)
    values (existing, 'merged', jsonb_build_object('full_name', p_full_name));

    return query
      select l.id, l.ref, false from public.leads l where l.id = existing;
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
  insert into public.notifications (lead_id, channel, to_address, template, payload)
  values (
    new_id, 'sms', p_whatsapp, 'lead_ack_sms',
    jsonb_build_object(
      'ref', new_ref,
      'service_name', service_name,
      'owner_first_name', split_part(owner.full_name, ' ', 1)
    )
  );

  -- With no owner the lead waits in the inbox, unassigned (F-10).
  if owner.id is not null then
    insert into public.notifications (lead_id, channel, to_address, template, payload)
    values (
      new_id, 'email', owner.email, 'lead_new_owner_email',
      jsonb_build_object(
        'ref', new_ref,
        'service_name', service_name,
        'lead_name', p_full_name,
        'lead_id', new_id
      )
    );
  end if;

  return query select new_id, new_ref, true;
end;
$$;

-- Saving a step twice replaces its answers. A lead stays partial until every
-- step is saved. Attribution only fills gaps, so the first touch is kept;
-- heard_from is the visitor's own latest answer.
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
  p_utm_campaign text default null
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

  insert into public.lead_steps (lead_id, step_index, step_key, answers, saved_at)
  values (p_lead_id, p_step_index, p_step_key, p_answers, now())
  on conflict (lead_id, step_index) do update
    set step_key = excluded.step_key, answers = excluded.answers, saved_at = excluded.saved_at;

  completed := greatest(lead.steps_completed, p_step_index + 1);

  update public.leads l
  set steps_completed = completed,
    is_partial = completed < lead.steps_total,
    heard_from = coalesce(p_heard_from, l.heard_from),
    source_page = coalesce(l.source_page, p_source_page),
    referrer = coalesce(l.referrer, p_referrer),
    utm_source = coalesce(l.utm_source, p_utm_source),
    utm_medium = coalesce(l.utm_medium, p_utm_medium),
    utm_campaign = coalesce(l.utm_campaign, p_utm_campaign)
  where l.id = p_lead_id;

  insert into public.lead_events (lead_id, type, data)
  values (p_lead_id, 'step_saved', jsonb_build_object('step_index', p_step_index, 'step_key', p_step_key));

  if completed = lead.steps_total and lead.steps_completed < lead.steps_total then
    insert into public.lead_events (lead_id, type) values (p_lead_id, 'completed');
  end if;

  return query select completed, lead.steps_total, completed < lead.steps_total;
end;
$$;

revoke execute on function public.create_or_attach_lead(text, text, text, text, integer, integer, text, text, text, text, text)
  from public, anon, authenticated;
revoke execute on function public.save_lead_step(uuid, integer, text, jsonb, text, text, text, text, text, text)
  from public, anon, authenticated;

grant execute on function public.create_or_attach_lead(text, text, text, text, integer, integer, text, text, text, text, text)
  to service_role;
grant execute on function public.save_lead_step(uuid, integer, text, jsonb, text, text, text, text, text, text)
  to service_role;
