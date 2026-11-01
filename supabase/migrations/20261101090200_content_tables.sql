-- ERD 2: the nine content tables plus video_placements. Every content row has
-- publish_state, owner_id and timestamps. House rules that must hold whatever
-- the portal does are CHECK constraints here.
-- To reverse: drop these tables.

create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  where_text text,
  levels text[] not null default '{}',
  covers text,
  official_url text check (official_url ~* '^https?://'),
  opens_on date,
  deadline_on date,
  deadline_text text,
  verified_on date,
  verified_by uuid references public.staff (id) on delete set null,
  not_pay_to_apply boolean not null default false,
  publish_state public.publish_state not null default 'draft',
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scholarships_dates_in_order check (deadline_on >= opens_on),
  -- The two ticks: dates checked on the official page, and free to apply.
  constraint scholarships_publish_needs_checks check (
    publish_state <> 'published'
    or (official_url is not null and verified_on is not null and not_pay_to_apply)
  )
);

create index scholarships_publish_state_idx on public.scholarships (publish_state);
create index scholarships_deadline_on_idx on public.scholarships (deadline_on);
create index scholarships_owner_id_idx on public.scholarships (owner_id);
create index scholarships_verified_by_idx on public.scholarships (verified_by);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body jsonb not null default '{}',
  body_html text,
  category public.post_category not null,
  author_id uuid references public.staff (id) on delete set null,
  cover_path text,
  cover_alt text,
  seo_title text,
  seo_description text,
  publish_state public.publish_state not null default 'draft',
  published_at timestamptz,
  reviewed_by uuid references public.staff (id) on delete set null,
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_cover_needs_alt check (cover_path is null or cover_alt is not null)
);

create index posts_publish_state_idx on public.posts (publish_state, published_at desc);
create index posts_category_idx on public.posts (category);
create index posts_author_id_idx on public.posts (author_id);
create index posts_reviewed_by_idx on public.posts (reviewed_by);
create index posts_owner_id_idx on public.posts (owner_id);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  platform public.video_platform not null,
  url text not null check (url ~* '^https?://'),
  embed_html text,
  thumbnail_url text,
  title text not null,
  keyword text,
  pinned boolean not null default false,
  publish_state public.publish_state not null default 'draft',
  added_by uuid references public.staff (id) on delete set null,
  published_at timestamptz,
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint videos_publish_needs_keyword check (
    publish_state <> 'published' or keyword is not null
  )
);

create index videos_publish_state_idx on public.videos (publish_state, published_at desc);
create index videos_platform_idx on public.videos (platform);
create index videos_added_by_idx on public.videos (added_by);
create index videos_owner_id_idx on public.videos (owner_id);

create table public.video_placements (
  video_id uuid not null references public.videos (id) on delete cascade,
  page_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (video_id, page_key)
);

create index video_placements_page_key_idx on public.video_placements (page_key);

-- internal_school_name must never reach the public: see the column grants in
-- the grants migration.
create table public.programmes (
  id uuid primary key default gen_random_uuid(),
  kind public.programme_kind not null,
  country text not null,
  city text,
  level text,
  title text not null,
  duration_text text,
  tuition_text text,
  keyword text,
  correct_as_of date,
  internal_school_name text,
  publish_state public.publish_state not null default 'draft',
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint programmes_publish_needs_details check (
    publish_state <> 'published'
    or (keyword is not null and correct_as_of is not null)
  )
);

create index programmes_publish_state_idx on public.programmes (publish_state);
create index programmes_kind_idx on public.programmes (kind);
create index programmes_owner_id_idx on public.programmes (owner_id);

create table public.openings (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  sector text,
  title text not null,
  requirements text,
  candidate_costs text,
  keyword text,
  correct_as_of date,
  publish_state public.publish_state not null default 'draft',
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint openings_publish_needs_details check (
    publish_state <> 'published'
    or (keyword is not null and correct_as_of is not null)
  )
);

create index openings_publish_state_idx on public.openings (publish_state);
create index openings_owner_id_idx on public.openings (owner_id);

create table public.drives (
  id uuid primary key default gen_random_uuid(),
  host_name text not null,
  drive_date date,
  applicants_count integer check (applicants_count >= 0),
  photo_path text,
  publish_state public.publish_state not null default 'draft',
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index drives_publish_state_idx on public.drives (publish_state);
create index drives_owner_id_idx on public.drives (owner_id);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  destination text not null,
  starts_on date,
  ends_on date,
  price_from_ghs numeric(10, 2) check (price_from_ghs >= 0),
  seats_left integer check (seats_left >= 0),
  photo_path text,
  publish_state public.publish_state not null default 'draft',
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_dates_in_order check (ends_on >= starts_on)
);

create index trips_publish_state_idx on public.trips (publish_state);
create index trips_owner_id_idx on public.trips (owner_id);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  service_key text references public.services (key) on delete set null,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  publish_state public.publish_state not null default 'draft',
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_publish_state_idx on public.faqs (publish_state);
create index faqs_service_key_idx on public.faqs (service_key);
create index faqs_owner_id_idx on public.faqs (owner_id);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  service_key text references public.services (key) on delete set null,
  year integer check (year between 2000 and 2100),
  quote text not null,
  photo_path text,
  permission_on_file boolean not null default false,
  publish_state public.publish_state not null default 'draft',
  owner_id uuid references public.staff (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint testimonials_publish_needs_permission check (
    publish_state <> 'published' or permission_on_file
  )
);

create index testimonials_publish_state_idx on public.testimonials (publish_state);
create index testimonials_service_key_idx on public.testimonials (service_key);
create index testimonials_owner_id_idx on public.testimonials (owner_id);

alter table public.scholarships enable row level security;
alter table public.posts enable row level security;
alter table public.videos enable row level security;
alter table public.video_placements enable row level security;
alter table public.programmes enable row level security;
alter table public.openings enable row level security;
alter table public.drives enable row level security;
alter table public.trips enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;

create trigger scholarships_set_updated_at before update on public.scholarships
  for each row execute function public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();
create trigger videos_set_updated_at before update on public.videos
  for each row execute function public.set_updated_at();
create trigger video_placements_set_updated_at before update on public.video_placements
  for each row execute function public.set_updated_at();
create trigger programmes_set_updated_at before update on public.programmes
  for each row execute function public.set_updated_at();
create trigger openings_set_updated_at before update on public.openings
  for each row execute function public.set_updated_at();
create trigger drives_set_updated_at before update on public.drives
  for each row execute function public.set_updated_at();
create trigger trips_set_updated_at before update on public.trips
  for each row execute function public.set_updated_at();
create trigger faqs_set_updated_at before update on public.faqs
  for each row execute function public.set_updated_at();
create trigger testimonials_set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();
