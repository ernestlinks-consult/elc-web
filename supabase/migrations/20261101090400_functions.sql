-- Lead reference, role checks and the duplicate-lead helper.
-- To reverse: drop these functions (the rls migration depends on the role checks).

-- One sequence across services, as in the Data Model's Key SQL.
create function public.next_lead_ref(p_service text)
returns text
language sql
set search_path = ''
as $$
  select 'ELC-' || s.ref_prefix || '-' || nextval('public.lead_ref_seq')
  from public.services s
  where s.key = p_service;
$$;

-- Null for anyone who is not active staff, so disabling a person removes every
-- policy that depends on a role straight away (P-01).
create function public.staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select s.role
  from public.staff s
  where s.id = auth.uid() and s.is_active;
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.staff_role() = 'admin', false);
$$;

-- Editors only: front desk has no content editing, whatever rows exist.
create function public.has_content_access(p_type public.content_type)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.staff_role() = 'editor' and exists (
    select 1
    from public.staff_content_access a
    where a.staff_id = auth.uid() and a.content_type = p_type
  );
$$;

-- F-12: the newest lead for this number and service from the last 7 calendar
-- days in Africa/Accra, or null. Expects whatsapp in international form.
create function public.find_duplicate_lead(p_whatsapp text, p_service text)
returns uuid
language sql
stable
set search_path = ''
as $$
  select l.id
  from public.leads l
  where l.whatsapp = p_whatsapp
    and l.service_key = p_service
    and (l.created_at at time zone 'Africa/Accra')::date
      >= (now() at time zone 'Africa/Accra')::date - 7
  order by l.created_at desc
  limit 1;
$$;

revoke execute on function public.next_lead_ref(text) from public, anon, authenticated;
revoke execute on function public.find_duplicate_lead(text, text) from public, anon, authenticated;
revoke execute on function public.staff_role() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.has_content_access(public.content_type) from public, anon;

grant execute on function public.next_lead_ref(text) to service_role;
grant execute on function public.find_duplicate_lead(text, text) to service_role;
grant execute on function public.staff_role() to authenticated, service_role;
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.has_content_access(public.content_type) to authenticated, service_role;
