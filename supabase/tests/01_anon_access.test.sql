begin;
select * from no_plan();

-- Fixtures, as the database owner.
insert into public.posts (id, slug, title, category, publish_state)
values
  ('10000000-0000-4000-8000-000000000001', 'test-draft', 'Test draft', 'exams', 'draft'),
  ('10000000-0000-4000-8000-000000000002', 'test-review', 'Test review', 'exams', 'in_review'),
  ('10000000-0000-4000-8000-000000000003', 'test-published', 'Test published', 'exams', 'published');

insert into public.programmes (id, kind, country, title, keyword, correct_as_of, internal_school_name, publish_state)
values ('10000000-0000-4000-8000-000000000004', 'study', 'Malta', 'Test draft programme', 'TEST', '2026-11-01', 'Secret School', 'draft');

insert into public.leads (ref, service_key, full_name, whatsapp, best_time, consent_at, steps_total, form_version)
values ('ELC-PP-1', 'passport', 'Test Lead', '+233240000000', 'Morning', now(), 7, 1);
insert into public.messages (full_name, whatsapp, body, consent_at)
values ('Test Person', '+233240000000', 'Hello', now());
insert into public.subscribers (whatsapp, consent_at) values ('+233240000000', now());
insert into public.events (name) values ('form_open');
insert into public.notifications (channel, to_address, template, idempotency_key) values ('sms', '+233240000000', 'ack', 'test:ack');

select ok((select count(*) > 0 from public.audit_log), 'fixtures: audit_log has rows');

set local role anon;
set local request.jwt.claims to '{"role": "anon"}';

-- Published content and public views.
select ok((select count(*) >= 3 from public.posts), 'anon reads published posts');
select is(
  (select count(*)::int from public.posts where publish_state <> 'published'),
  0,
  'anon reads no draft or in-review posts'
);
select is(
  (select count(*)::int from public.posts where id = '10000000-0000-4000-8000-000000000003'),
  1,
  'anon reads the published test post'
);
select is(
  (select count(*)::int from public.programmes where id = '10000000-0000-4000-8000-000000000004'),
  0,
  'anon reads no draft programme'
);
select ok((select count(*) > 0 from public.scholarships_public), 'anon reads scholarships_public');
select ok((select count(*) > 0 from public.prices_public), 'anon reads prices_public');
select is((select count(*)::int from public.staff_public), 6, 'anon reads six people from staff_public');
select is((select count(*)::int from public.settings_public), 7, 'anon reads the seven public settings');
select is((select count(*)::int from public.live_schedule_public), 5, 'anon reads five LIVE slots');
select is(
  (select count(*)::int from public.live_schedule_public where topic is not null),
  0,
  'LIVE topics are null until ELC sets them'
);
select is((select count(*)::int from public.services), 7, 'anon reads seven services');
select is(
  (select count(*)::int from public.settings where key = 'official_momo'),
  0,
  'anon cannot read official_momo from settings'
);

-- Private columns.
select throws_ok(
  $$ select internal_school_name from public.programmes $$,
  '42501', null, 'anon cannot read internal_school_name'
);
select throws_ok($$ select email from public.staff $$, '42501', null, 'anon cannot read staff email');
select throws_ok($$ select phone from public.staff $$, '42501', null, 'anon cannot read staff phone');
select throws_ok($$ select owner_id from public.services $$, '42501', null, 'anon cannot read service owners');

-- Private tables.
select throws_ok($$ select * from public.leads $$, '42501', null, 'anon cannot read leads');
select throws_ok($$ select * from public.lead_steps $$, '42501', null, 'anon cannot read lead_steps');
select throws_ok($$ select * from public.lead_events $$, '42501', null, 'anon cannot read lead_events');
select throws_ok($$ select * from public.messages $$, '42501', null, 'anon cannot read messages');
select throws_ok($$ select * from public.subscribers $$, '42501', null, 'anon cannot read subscribers');
select throws_ok($$ select * from public.notifications $$, '42501', null, 'anon cannot read notifications');
select throws_ok($$ select * from public.audit_log $$, '42501', null, 'anon cannot read audit_log');
select throws_ok($$ select * from public.events $$, '42501', null, 'anon cannot read events');
select throws_ok($$ select * from public.staff_content_access $$, '42501', null, 'anon cannot read staff_content_access');

-- Writes.
select is_empty(
  $$ select c.relname from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public' and c.relkind in ('r', 'v')
       and (has_any_column_privilege('anon', c.oid, 'INSERT')
         or has_any_column_privilege('anon', c.oid, 'UPDATE')
         or has_table_privilege('anon', c.oid, 'DELETE')
         or has_table_privilege('anon', c.oid, 'TRUNCATE')) $$,
  'anon has no write privilege on any table or view'
);
select throws_ok(
  $$ insert into public.leads (ref, service_key, full_name, whatsapp, best_time, consent_at, steps_total, form_version)
     values ('ELC-PP-2', 'passport', 'Bot', '+233240000001', 'Now', now(), 7, 1) $$,
  '42501', null, 'anon cannot insert a lead'
);
select throws_ok(
  $$ insert into public.subscribers (whatsapp, consent_at) values ('+233240000001', now()) $$,
  '42501', null, 'anon cannot insert a subscriber'
);
select throws_ok(
  $$ insert into public.messages (full_name, whatsapp, body, consent_at) values ('Bot', '+233240000001', 'x', now()) $$,
  '42501', null, 'anon cannot insert a message'
);
select throws_ok(
  $$ insert into public.events (name) values ('form_open') $$,
  '42501', null, 'anon cannot insert an event'
);
select throws_ok(
  $$ update public.posts set title = 'Hacked' $$,
  '42501', null, 'anon cannot update content'
);

-- Functions.
select throws_ok($$ select public.next_lead_ref('passport') $$, '42501', null, 'anon cannot burn lead references');
select throws_ok($$ select public.is_admin() $$, '42501', null, 'anon cannot call is_admin');
select throws_ok(
  $$ select public.find_duplicate_lead('+233240000000', 'passport') $$,
  '42501', null, 'anon cannot probe for leads by phone number'
);

reset role;

select * from finish();
rollback;
