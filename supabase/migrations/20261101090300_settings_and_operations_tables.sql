-- ERD 2: review comments, settings tables, and the system-written logs.
-- To reverse: drop these tables.

-- content_id points at a row in the table named by content_type, so it has no
-- foreign key.
create table public.content_comments (
  id uuid primary key default gen_random_uuid(),
  content_type public.content_type not null,
  content_id uuid not null,
  author_id uuid references public.staff (id) on delete set null,
  body text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_comments_item_idx on public.content_comments (content_type, content_id);
create index content_comments_author_id_idx on public.content_comments (author_id);

create table public.prices (
  key text primary key,
  label text not null,
  amount_ghs numeric(10, 2) check (amount_ghs >= 0),
  time_text text,
  is_public boolean not null default false,
  never_public boolean not null default false,
  shown_on text[] not null default '{}',
  updated_by uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prices_never_public_stays_private check (not (never_public and is_public)),
  constraint prices_public_needs_amount check (not is_public or amount_ghs is not null)
);

create index prices_updated_by_idx on public.prices (updated_by);

create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index settings_updated_by_idx on public.settings (updated_by);

-- Times are Africa/Accra. topic stays null until ELC sets per-day topics.
create table public.live_schedule (
  weekday integer primary key check (weekday between 1 and 5),
  topic text,
  host_id uuid references public.staff (id) on delete set null,
  starts_at_time time not null,
  ends_at_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint live_schedule_times_in_order check (ends_at_time > starts_at_time)
);

create index live_schedule_host_id_idx on public.live_schedule (host_id);

-- No foreign key on actor_id: the log must outlive the staff member.
create table public.audit_log (
  id bigserial primary key,
  actor_id uuid,
  action text not null check (action in ('insert', 'update', 'delete')),
  table_name text not null,
  row_id text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_actor_id_idx on public.audit_log (actor_id, created_at desc);
create index audit_log_table_row_idx on public.audit_log (table_name, row_id);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

create table public.events (
  id bigserial primary key,
  name text not null,
  page text,
  session_id text,
  lead_id uuid references public.leads (id) on delete set null,
  props jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index events_name_idx on public.events (name, created_at desc);
create index events_lead_id_idx on public.events (lead_id);
create index events_created_at_idx on public.events (created_at desc);

alter table public.content_comments enable row level security;
alter table public.prices enable row level security;
alter table public.settings enable row level security;
alter table public.live_schedule enable row level security;
alter table public.audit_log enable row level security;
alter table public.events enable row level security;

create trigger content_comments_set_updated_at before update on public.content_comments
  for each row execute function public.set_updated_at();
create trigger prices_set_updated_at before update on public.prices
  for each row execute function public.set_updated_at();
create trigger settings_set_updated_at before update on public.settings
  for each row execute function public.set_updated_at();
create trigger live_schedule_set_updated_at before update on public.live_schedule
  for each row execute function public.set_updated_at();
