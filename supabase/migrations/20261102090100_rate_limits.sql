-- F-08: rate limits for public forms. Keys are hashed, so this table holds no
-- IP addresses or phone numbers.
-- To reverse: drop public.check_rate_limit and public.rate_limits.

create table public.rate_limits (
  id bigserial primary key,
  scope text not null,
  key_hash text not null,
  created_at timestamptz not null default now()
);

create index rate_limits_lookup_idx on public.rate_limits (scope, key_hash, created_at desc);
create index rate_limits_created_at_idx on public.rate_limits (created_at);

-- RLS with no policies: only the service role reaches this table.
alter table public.rate_limits enable row level security;
grant all on public.rate_limits to service_role;
grant all on sequence public.rate_limits_id_seq to service_role;

-- Records a hit and returns true, or returns false if the limit is already
-- reached. A blocked attempt is not recorded, so a window always ends on time.
create function public.check_rate_limit(
  p_scope text,
  p_key text,
  p_limit integer,
  p_window interval
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  hashed text := encode(extensions.digest(p_scope || ':' || p_key, 'sha256'), 'hex');
  hits integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(hashed, 0));

  delete from public.rate_limits r where r.created_at < now() - interval '1 day';

  select count(*) into hits
  from public.rate_limits r
  where r.scope = p_scope
    and r.key_hash = hashed
    and r.created_at > now() - p_window;

  if hits >= p_limit then
    return false;
  end if;

  insert into public.rate_limits (scope, key_hash) values (p_scope, hashed);
  return true;
end;
$$;

revoke execute on function public.check_rate_limit(text, text, integer, interval) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, interval) to service_role;
