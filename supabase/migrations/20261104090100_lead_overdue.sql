-- P-05: a New lead is overdue once it has waited longer than the reply promise,
-- counted in working hours. Computed here so the inbox and dashboard always agree.
-- Public holidays are not counted yet: they read as working days.
-- To reverse: drop public.leads_inbox and both functions.

-- Minutes between two moments that fall inside working hours from settings.
-- p_cap stops early once the answer is known, so old leads stay cheap.
create function public.working_minutes_between(
  p_from timestamptz,
  p_to timestamptz,
  p_cap integer default null
)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  hours jsonb := coalesce(
    (select s.value from public.settings s where s.key = 'working_hours'),
    '{"days": [1, 2, 3, 4, 5], "start": "08:00", "end": "17:00", "time_zone": "Africa/Accra"}'
  );
  zone text := hours ->> 'time_zone';
  day_start time := (hours ->> 'start')::time;
  day_end time := (hours ->> 'end')::time;
  local_from timestamp := p_from at time zone zone;
  local_to timestamp := p_to at time zone zone;
  day date := local_from::date;
  total numeric := 0;
  overlap interval;
begin
  while day <= local_to::date loop
    if hours -> 'days' @> to_jsonb(extract(isodow from day)::integer) then
      overlap := least(day + day_end, local_to) - greatest(day + day_start, local_from);
      if overlap > interval '0' then
        total := total + extract(epoch from overlap) / 60;
      end if;
    end if;

    exit when p_cap is not null and total >= p_cap;
    day := day + 1;
  end loop;

  return floor(total);
end;
$$;

create function public.lead_is_overdue(
  p_status public.lead_status,
  p_created_at timestamptz,
  p_now timestamptz default now()
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  promise integer;
begin
  if p_status <> 'new' then
    return false;
  end if;

  promise := coalesce(
    (select (s.value #>> '{}')::integer from public.settings s where s.key = 'reply_promise_minutes'),
    120
  );

  return public.working_minutes_between(p_created_at, p_now, promise + 1) > promise;
end;
$$;

revoke execute on function public.working_minutes_between(timestamptz, timestamptz, integer) from public, anon;
revoke execute on function public.lead_is_overdue(public.lead_status, timestamptz, timestamptz) from public, anon;
grant execute on function public.working_minutes_between(timestamptz, timestamptz, integer) to authenticated, service_role;
grant execute on function public.lead_is_overdue(public.lead_status, timestamptz, timestamptz) to authenticated, service_role;

create view public.leads_inbox
with (security_invoker = true)
as
select l.*,
  s.name as service_name,
  o.full_name as owner_name,
  public.lead_is_overdue(l.status, l.created_at) as overdue
from public.leads l
join public.services s on s.key = l.service_key
left join public.staff o on o.id = l.owner_id;

grant select on public.leads_inbox to authenticated, service_role;
