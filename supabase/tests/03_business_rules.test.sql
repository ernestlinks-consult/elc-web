begin;
select * from no_plan();

-- Prices ------------------------------------------------------------------
select is(
  (select count(*)::int from public.prices_public where key in ('school_application', 'visa_processing')),
  0,
  'never_public prices never appear in prices_public'
);
select is(
  (select amount_ghs from public.prices_public where key = 'passport_standard'),
  600.00,
  'passport standard is GH¢600'
);
select is(
  (select amount_ghs from public.prices_public where key = 'passport_express'),
  1800.00,
  'passport express is GH¢1,800'
);
select is(
  (select count(*)::int from public.prices where never_public and amount_ghs is not null),
  0,
  'never_public prices have no amount in the seed'
);
select throws_ok(
  $$ update public.prices set amount_ghs = 100, is_public = true where key = 'visa_processing' $$,
  '23514', null, 'a never_public price cannot be made public'
);

-- Scholarships ------------------------------------------------------------
insert into public.scholarships (slug, name, official_url, opens_on, deadline_on, verified_on, not_pay_to_apply, publish_state)
values
  ('test-past', 'Past', 'https://example.test', null, (now() at time zone 'Africa/Accra')::date - 1, '2026-11-01', true, 'published'),
  ('test-today', 'Deadline today', 'https://example.test', null, (now() at time zone 'Africa/Accra')::date, '2026-11-01', true, 'published'),
  ('test-current', 'Current', 'https://example.test', (now() at time zone 'Africa/Accra')::date - 1, (now() at time zone 'Africa/Accra')::date + 30, '2026-11-01', true, 'published'),
  ('test-opens-today', 'Opens today', 'https://example.test', (now() at time zone 'Africa/Accra')::date, null, '2026-11-01', true, 'published'),
  ('test-future', 'Future', 'https://example.test', (now() at time zone 'Africa/Accra')::date + 1, (now() at time zone 'Africa/Accra')::date + 30, '2026-11-01', true, 'published'),
  ('test-draft', 'Draft', 'https://example.test', null, null, null, false, 'draft');

select is((select status from public.scholarships_public where slug = 'test-past'), 'closed', 'a past deadline is closed');
select is((select status from public.scholarships_public where slug = 'test-today'), 'open', 'a scholarship stays open on its deadline day');
select is((select status from public.scholarships_public where slug = 'test-current'), 'open', 'a current scholarship is open');
select is((select status from public.scholarships_public where slug = 'test-opens-today'), 'open', 'a scholarship opening today is open');
select is((select status from public.scholarships_public where slug = 'test-future'), 'opening_soon', 'a future opening is opening_soon');
select is((select count(*)::int from public.scholarships_public where slug = 'test-draft'), 0, 'unpublished scholarships never appear');

select throws_ok(
  $$ update public.scholarships set official_url = null where slug = 'test-current' $$,
  '23514', null, 'a published scholarship must keep its official URL'
);
select throws_ok(
  $$ update public.scholarships set not_pay_to_apply = false where slug = 'test-current' $$,
  '23514', null, 'a published scholarship needs the free-to-apply tick'
);
select throws_ok(
  $$ update public.scholarships set verified_on = null where slug = 'test-current' $$,
  '23514', null, 'a published scholarship needs the verified tick'
);

-- With the constraint gone, the view is still a second lock.
alter table public.scholarships drop constraint scholarships_publish_needs_checks;
update public.scholarships set official_url = null where slug = 'test-current';
select is(
  (select count(*)::int from public.scholarships_public where slug = 'test-current'),
  0,
  'a scholarship without official_url never appears, even without the constraint'
);

-- Other publishing rules ---------------------------------------------------
select throws_ok(
  $$ insert into public.testimonials (display_name, quote, publish_state) values ('A', 'B', 'published') $$,
  '23514', null, 'a testimonial cannot publish without permission on file'
);
select lives_ok(
  $$ insert into public.testimonials (display_name, quote, publish_state) values ('A', 'B', 'draft') $$,
  'a testimonial without permission can stay a draft'
);
select throws_ok(
  $$ insert into public.programmes (kind, country, title, publish_state) values ('study', 'Malta', 'X', 'published') $$,
  '23514', null, 'a programme cannot publish without keyword and correct-as-of date'
);

-- Leads --------------------------------------------------------------------
select matches(public.next_lead_ref('passport'), '^ELC-PP-[0-9]{4,}$', 'passport refs look like ELC-PP-####');
select matches(public.next_lead_ref('birth'), '^ELC-BC-[0-9]{4,}$', 'birth refs look like ELC-BC-####');
select matches(public.next_lead_ref('school'), '^ELC-SA-[0-9]{4,}$', 'school refs look like ELC-SA-####');
select matches(public.next_lead_ref('visa'), '^ELC-VS-[0-9]{4,}$', 'visa refs look like ELC-VS-####');
select matches(public.next_lead_ref('work'), '^ELC-WA-[0-9]{4,}$', 'work refs look like ELC-WA-####');
select matches(public.next_lead_ref('exams'), '^ELC-EX-[0-9]{4,}$', 'exams refs look like ELC-EX-####');
select matches(public.next_lead_ref('travel'), '^ELC-TR-[0-9]{4,}$', 'travel refs look like ELC-TR-####');
select is(public.next_lead_ref('nonsense'), null, 'an unknown service gets no ref');

select throws_ok(
  $$ insert into public.leads (ref, service_key, full_name, whatsapp, best_time, consent_at, steps_total, form_version)
     values ('ELC-PP-1', 'passport', 'A', '0240000000', 'Morning', now(), 7, 1) $$,
  '23514', null, 'a lead number must be in international form'
);

insert into public.leads (id, ref, service_key, full_name, whatsapp, best_time, consent_at, steps_total, form_version, owner_id)
values ('20000000-0000-4000-8000-000000000001', public.next_lead_ref('passport'), 'passport', 'Timeline Lead', '+233240000009', 'Morning', now(), 7, 1, '00000000-0000-4000-8000-000000000004');

select results_eq(
  $$ select type::text from public.lead_events where lead_id = '20000000-0000-4000-8000-000000000001' order by type $$,
  $$ values ('assigned'), ('created') $$,
  'a new lead with an owner writes created and assigned events'
);
select is(
  (select first_reply_at from public.leads where id = '20000000-0000-4000-8000-000000000001'),
  null,
  'a new lead has no first reply yet'
);
select is(
  (select actor_id from public.lead_events where lead_id = '20000000-0000-4000-8000-000000000001' and type = 'created'),
  null,
  'a system-created lead has no actor'
);

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000003", "role": "authenticated"}';
update public.leads set status = 'contacted' where id = '20000000-0000-4000-8000-000000000001';
reset role;
set local request.jwt.claims to '';

select isnt(
  (select first_reply_at from public.leads where id = '20000000-0000-4000-8000-000000000001'),
  null,
  'leaving new sets first_reply_at'
);
select results_eq(
  $$ select actor_id, data ->> 'from', data ->> 'to' from public.lead_events
     where lead_id = '20000000-0000-4000-8000-000000000001' and type = 'status_changed' $$,
  $$ values ('00000000-0000-4000-8000-000000000003'::uuid, 'new', 'contacted') $$,
  'a status change writes who and what to lead_events'
);

create temporary table first_reply as
select first_reply_at from public.leads where id = '20000000-0000-4000-8000-000000000001';

update public.leads set status = 'new' where id = '20000000-0000-4000-8000-000000000001';
update public.leads set status = 'started' where id = '20000000-0000-4000-8000-000000000001';
select is(
  (select first_reply_at from public.leads where id = '20000000-0000-4000-8000-000000000001'),
  (select first_reply_at from first_reply),
  'first_reply_at is only set the first time'
);

update public.leads set owner_id = '00000000-0000-4000-8000-000000000006' where id = '20000000-0000-4000-8000-000000000001';
select is(
  (select count(*)::int from public.lead_events where lead_id = '20000000-0000-4000-8000-000000000001' and type = 'assigned'),
  2,
  'an owner change writes an assigned event'
);

select throws_ok(
  $$ update public.leads set status = 'closed' where id = '20000000-0000-4000-8000-000000000001' $$,
  '23514', null, 'closing a lead needs a reason'
);
select lives_ok(
  $$ update public.leads set status = 'closed', closed_reason = 'Not interested' where id = '20000000-0000-4000-8000-000000000001' $$,
  'a lead closes with a reason'
);

-- Duplicate helper -----------------------------------------------------------
select is(
  public.find_duplicate_lead('+233240000009', 'passport'),
  '20000000-0000-4000-8000-000000000001'::uuid,
  'same phone and service within 7 days is a duplicate'
);
select is(public.find_duplicate_lead('+233240000009', 'visa'), null, 'a different service is not a duplicate');
select is(public.find_duplicate_lead('+233240000008', 'passport'), null, 'a different phone is not a duplicate');

update public.leads set created_at = now() - interval '8 days' where id = '20000000-0000-4000-8000-000000000001';
select is(public.find_duplicate_lead('+233240000009', 'passport'), null, 'a lead older than 7 days is not a duplicate');

-- Audit ----------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000002", "role": "authenticated"}';
update public.prices set time_text = 'About 5 weeks' where key = 'passport_standard';
reset role;
set local request.jwt.claims to '';

select results_eq(
  $$ select actor_id, action, row_id, before ->> 'time_text', after ->> 'time_text'
     from public.audit_log where table_name = 'prices' and action = 'update' $$,
  $$ values ('00000000-0000-4000-8000-000000000002'::uuid, 'update'::text, 'passport_standard'::text, 'About 1 month'::text, 'About 5 weeks'::text) $$,
  'audit_log records actor, action, row, before and after'
);

update public.settings set value = value where key = 'hours';
select is(
  (select count(*)::int from public.audit_log where table_name = 'settings' and action = 'update'),
  0,
  'an update that changes nothing is not audited'
);

delete from public.faqs where question like '[Sample] Where%';
select is(
  (select count(*)::int from public.audit_log where table_name = 'faqs' and action = 'delete'),
  1,
  'a delete is audited'
);

select * from finish();
rollback;
