-- ERD 1: staff, services, leads and everything that hangs off a lead.
-- RLS is enabled in the same file as each table; policies are in the rls migration.
-- To reverse: drop these tables, then public.set_updated_at().

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public;

create table public.staff (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  title text not null,
  role public.staff_role not null,
  phone text,
  email text not null unique,
  is_active boolean not null default true,
  show_on_site boolean not null default false,
  photo_path text,
  bio text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_show_on_site_idx on public.staff (show_on_site, is_active, sort_order);

create table public.staff_content_access (
  staff_id uuid not null references public.staff (id) on delete cascade,
  content_type public.content_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (staff_id, content_type)
);

create table public.services (
  key text primary key check (
    key in ('passport', 'birth', 'school', 'visa', 'work', 'exams', 'travel')
  ),
  name text not null,
  slug text not null unique,
  ref_prefix text not null unique check (ref_prefix ~ '^[A-Z]{2}$'),
  owner_id uuid references public.staff (id) on delete set null,
  whatsapp_keyword text not null,
  short_description text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_owner_id_idx on public.services (owner_id);

create sequence public.lead_ref_seq start 1000;

-- whatsapp is stored in international form so the duplicate check compares like
-- with like. The server action normalises 024... and +233... before saving.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique check (ref ~ '^ELC-[A-Z]{2}-[0-9]+$'),
  service_key text not null references public.services (key) on delete restrict,
  full_name text not null,
  whatsapp text not null check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  best_time text not null,
  consent_at timestamptz not null,
  status public.lead_status not null default 'new',
  owner_id uuid references public.staff (id) on delete set null,
  steps_completed integer not null default 0 check (steps_completed >= 0),
  steps_total integer not null check (steps_total > 0),
  is_partial boolean not null default false,
  form_version integer not null check (form_version > 0),
  source_page text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  heard_from text,
  first_reply_at timestamptz,
  closed_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_steps_within_total check (steps_completed <= steps_total),
  constraint leads_closed_needs_reason check (
    status <> 'closed' or nullif(btrim(closed_reason), '') is not null
  )
);

create index leads_service_key_idx on public.leads (service_key);
create index leads_status_idx on public.leads (status);
create index leads_owner_id_idx on public.leads (owner_id);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_duplicate_check_idx on public.leads (whatsapp, service_key, created_at desc);

create table public.lead_steps (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  step_index integer not null check (step_index >= 0),
  step_key text not null,
  answers jsonb not null default '{}',
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, step_index)
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  type public.lead_event_type not null,
  actor_id uuid references public.staff (id) on delete set null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index lead_events_lead_id_idx on public.lead_events (lead_id, created_at);
create index lead_events_actor_id_idx on public.lead_events (actor_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete cascade,
  channel public.notify_channel not null,
  to_address text not null,
  template text not null,
  payload jsonb not null default '{}',
  status public.notify_status not null default 'pending',
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  send_after timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_lead_id_idx on public.notifications (lead_id);
create index notifications_outbox_idx on public.notifications (status, send_after);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text not null check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  email text,
  topic text,
  body text not null,
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new', 'handled')),
  assigned_to uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index messages_status_idx on public.messages (status);
create index messages_assigned_to_idx on public.messages (assigned_to);
create index messages_created_at_idx on public.messages (created_at desc);

create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  whatsapp text not null check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  list text not null default 'scholarship_alerts' check (list in ('scholarship_alerts')),
  consent_at timestamptz not null,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (whatsapp, list)
);

create index subscribers_created_at_idx on public.subscribers (created_at desc);

alter table public.staff enable row level security;
alter table public.staff_content_access enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.lead_steps enable row level security;
alter table public.lead_events enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.subscribers enable row level security;

create trigger staff_set_updated_at before update on public.staff
  for each row execute function public.set_updated_at();
create trigger staff_content_access_set_updated_at before update on public.staff_content_access
  for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
create trigger leads_set_updated_at before update on public.leads
  for each row execute function public.set_updated_at();
create trigger lead_steps_set_updated_at before update on public.lead_steps
  for each row execute function public.set_updated_at();
create trigger notifications_set_updated_at before update on public.notifications
  for each row execute function public.set_updated_at();
create trigger messages_set_updated_at before update on public.messages
  for each row execute function public.set_updated_at();
create trigger subscribers_set_updated_at before update on public.subscribers
  for each row execute function public.set_updated_at();
