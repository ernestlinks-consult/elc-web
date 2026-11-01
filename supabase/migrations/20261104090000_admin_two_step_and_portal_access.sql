-- P-01: an admin without two-step sign-in has no admin powers, enforced here and
-- not only in the portal. The check is in staff_role() so an aal1 admin also fails
-- every "any staff" policy, not just is_admin().
-- To reverse: restore staff_role() from 20261101090400_functions.sql, then drop
-- what this file adds.

create or replace function public.staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select s.role
  from public.staff s
  where s.id = auth.uid()
    and s.is_active
    and (s.role <> 'admin' or auth.jwt() ->> 'aal' = 'aal2');
$$;

-- What the portal needs to route a signed-in person. It reads only their own row,
-- because staff_role() is deliberately null for the aal1 admin who must be sent to
-- two-step sign-in.
create function public.my_staff_access()
returns table (full_name text, role public.staff_role, is_active boolean, aal text)
language sql
stable
security definer
set search_path = ''
as $$
  select s.full_name, s.role, s.is_active, auth.jwt() ->> 'aal'
  from public.staff s
  where s.id = auth.uid();
$$;

revoke execute on function public.my_staff_access() from public, anon;
grant execute on function public.my_staff_access() to authenticated, service_role;

-- The lead page shows each message's status, so reading follows lead access. Rows
-- with no lead (contact form emails) stay admin only.
drop policy notifications_admin_read on public.notifications;

create policy notifications_read on public.notifications
  for select to authenticated
  using (public.is_admin() or lead_id in (select l.id from public.leads l));

-- Queues a fresh acknowledgement SMS. A new version gets a new idempotency key, so
-- this is the one deliberate way to send twice.
create function public.resend_lead_ack(p_lead_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  lead public.leads%rowtype;
  owner_name text;
  next_version integer;
begin
  if public.staff_role() not in ('admin', 'front_desk') or public.staff_role() is null then
    raise exception 'Only front desk and admins can resend' using errcode = '42501';
  end if;

  select l.* into lead from public.leads l where l.id = p_lead_id for update;
  if not found then
    raise exception 'Lead not found' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.notifications n
    where n.lead_id = p_lead_id
      and n.template = 'sms.lead_ack'
      and n.status in ('pending', 'sending')
  ) then
    return 'already_queued';
  end if;

  select split_part(s.full_name, ' ', 1) into owner_name
  from public.staff s where s.id = lead.owner_id and s.is_active;

  select count(*) + 1 into next_version
  from public.notifications n
  where n.lead_id = p_lead_id and n.template = 'sms.lead_ack';

  insert into public.notifications (lead_id, channel, to_address, template, payload, idempotency_key)
  values (
    p_lead_id, 'sms', lead.whatsapp, 'sms.lead_ack',
    jsonb_build_object(
      'ref', lead.ref,
      'first_name', split_part(lead.full_name, ' ', 1),
      'owner_first_name', owner_name
    ),
    'lead:' || p_lead_id || ':sms.lead_ack:v' || next_version
  );

  insert into public.lead_events (lead_id, type, actor_id, data)
  values (p_lead_id, 'note', auth.uid(), jsonb_build_object('text', 'Asked for the acknowledgement SMS to be sent again.'));

  return 'queued';
end;
$$;

revoke execute on function public.resend_lead_ack(uuid) from public, anon;
grant execute on function public.resend_lead_ack(uuid) to authenticated;

-- CSV exports leave the system, so they are logged like any other staff action.
alter table public.audit_log drop constraint audit_log_action_check;
alter table public.audit_log add constraint audit_log_action_check
  check (action in ('insert', 'update', 'delete', 'export'));

create function public.log_export(p_table text, p_filters jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.staff_role() is null then
    raise exception 'Staff only' using errcode = '42501';
  end if;

  insert into public.audit_log (actor_id, action, table_name, row_id, after)
  values (auth.uid(), 'export', p_table, 'csv', p_filters);
end;
$$;

revoke execute on function public.log_export(text, jsonb) from public, anon;
grant execute on function public.log_export(text, jsonb) to authenticated;
