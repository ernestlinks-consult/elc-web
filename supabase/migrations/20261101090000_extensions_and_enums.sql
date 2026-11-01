-- Extensions and enums from docs/04-Data-Model-ERDs.md.
-- To reverse: drop the types below (cascade drops every column that uses them).

-- gen_random_uuid() is built into Postgres. pgcrypto is here for crypt(), which
-- the local seed uses to hash development passwords.
create extension if not exists pgcrypto with schema extensions;

create type public.staff_role as enum ('admin', 'editor', 'front_desk');

create type public.lead_status as enum (
  'new', 'contacted', 'started', 'paid', 'closed'
);

create type public.lead_event_type as enum (
  'created', 'step_saved', 'completed', 'status_changed', 'assigned', 'note',
  'sms_sent', 'email_sent', 'merged'
);

create type public.notify_channel as enum ('sms', 'email');

create type public.notify_status as enum ('pending', 'sent', 'failed');

create type public.publish_state as enum (
  'draft', 'in_review', 'published', 'archived'
);

create type public.content_type as enum (
  'scholarship', 'post', 'video', 'programme', 'opening', 'drive', 'trip',
  'faq', 'testimonial', 'team'
);

create type public.video_platform as enum (
  'tiktok', 'instagram', 'facebook', 'youtube'
);

create type public.post_category as enum (
  'passports', 'school_applications', 'visas', 'exams', 'scholarships',
  'student_stories', 'work_abroad', 'travel'
);

create type public.programme_kind as enum ('study', 'bridging');
