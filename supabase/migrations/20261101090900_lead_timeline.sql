-- P-03, P-04: lead timeline events and first-reply time, plus the column limit
-- on front desk updates. BEFORE triggers run in name order, so the guard sees
-- what the user sent, before first_reply_at and updated_at are set.
-- To reverse: drop the triggers, then these three functions.

-- RLS filters rows, not columns, so front desk's limit is enforced here.
create function public.leads_guard_front_desk()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed text[] := array['status', 'owner_id', 'closed_reason', 'updated_at'];
begin
  if public.staff_role() = 'front_desk' and (to_jsonb(old) - allowed) <> (to_jsonb(new) - allowed) then
    raise exception 'Front desk can only change status, owner and closed reason'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create function public.leads_set_first_reply()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'new' and new.status <> 'new' and old.first_reply_at is null then
    new.first_reply_at = now();
  end if;

  return new;
end;
$$;

create function public.leads_write_timeline()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Null for server actions and other system changes.
  actor uuid := (select s.id from public.staff s where s.id = auth.uid());
begin
  if tg_op = 'INSERT' then
    insert into public.lead_events (lead_id, type, actor_id, data)
    values (new.id, 'created', actor, jsonb_build_object('status', new.status));

    if new.owner_id is not null then
      insert into public.lead_events (lead_id, type, actor_id, data)
      values (new.id, 'assigned', actor, jsonb_build_object('from', null, 'to', new.owner_id));
    end if;

    return null;
  end if;

  if new.status is distinct from old.status then
    insert into public.lead_events (lead_id, type, actor_id, data)
    values (new.id, 'status_changed', actor, jsonb_build_object('from', old.status, 'to', new.status));
  end if;

  if new.owner_id is distinct from old.owner_id then
    insert into public.lead_events (lead_id, type, actor_id, data)
    values (new.id, 'assigned', actor, jsonb_build_object('from', old.owner_id, 'to', new.owner_id));
  end if;

  return null;
end;
$$;

revoke execute on function public.leads_guard_front_desk() from public, anon, authenticated;
revoke execute on function public.leads_set_first_reply() from public, anon, authenticated;
revoke execute on function public.leads_write_timeline() from public, anon, authenticated;

create trigger leads_a_guard_front_desk before update on public.leads
  for each row execute function public.leads_guard_front_desk();
create trigger leads_b_set_first_reply before update on public.leads
  for each row execute function public.leads_set_first_reply();
create trigger leads_write_timeline after insert or update on public.leads
  for each row execute function public.leads_write_timeline();
