begin;
select * from no_plan();

create temporary table first_lead as
select * from public.create_or_attach_lead(
  'passport', 'Ama Mensah', '+233240001001', 'Morning', 7, 1,
  '/services/passports', 'https://www.tiktok.com/', 'tiktok', 'social', 'drive'
);

-- New lead ----------------------------------------------------------------------
select is((select is_new from first_lead), true, 'a new number and service creates a lead');
select matches((select ref from first_lead), '^ELC-PP-[0-9]{4,}$', 'the lead gets a reference');
select results_eq(
  $$ select l.status::text, s.email, l.utm_source, l.source_page, l.steps_total, l.form_version
     from public.leads l join public.staff s on s.id = l.owner_id
     where l.id = (select lead_id from first_lead) $$,
  $$ values ('new'::text, 'grace@example.test'::text, 'tiktok'::text, '/services/passports'::text, 7, 1) $$,
  'status is new, the owner comes from the service, and attribution is stored'
);
select ok(
  (select consent_at is not null from public.leads where id = (select lead_id from first_lead)),
  'consent time is recorded'
);

-- Notifications ------------------------------------------------------------------
select results_eq(
  $$ select channel::text, to_address, template, status::text from public.notifications
     where lead_id = (select lead_id from first_lead) order by channel $$,
  $$ values
       ('email'::text, 'grace@example.test'::text, 'email.owner_new_lead'::text, 'pending'::text),
       ('sms'::text, '+233240001001'::text, 'sms.lead_ack'::text, 'pending'::text) $$,
  'a new lead enqueues one SMS to the lead and one email to the owner, both pending'
);
select is(
  (select payload ->> 'owner_first_name' from public.notifications where lead_id = (select lead_id from first_lead) and channel = 'sms'),
  'Grace',
  'the SMS payload names the owner'
);
select is(
  (select payload ->> 'ref' from public.notifications where lead_id = (select lead_id from first_lead) and channel = 'sms'),
  (select ref from first_lead),
  'the SMS payload carries the reference'
);

-- Duplicate ----------------------------------------------------------------------
create temporary table second_lead as
select * from public.create_or_attach_lead('passport', 'Ama M', '+233240001001', 'Evening', 7, 1);

select is((select is_new from second_lead), false, 'same phone and service within 7 days attaches');
select is((select lead_id from second_lead), (select lead_id from first_lead), 'it returns the same lead');
select is((select ref from second_lead), (select ref from first_lead), 'it returns the same reference');
select is(
  (select count(*)::int from public.leads where whatsapp = '+233240001001'),
  1,
  'no second lead exists'
);
select is(
  (select count(*)::int from public.notifications where lead_id = (select lead_id from first_lead)),
  2,
  'notifications are enqueued once per new lead'
);
select is(
  (select count(*)::int from public.lead_events where lead_id = (select lead_id from first_lead) and type = 'resubmitted'),
  1,
  'the attach is on the timeline'
);

select is(
  (select is_new from public.create_or_attach_lead('visa', 'Ama Mensah', '+233240001001', 'Morning', 4, 1)),
  true,
  'the same phone with another service is a new lead'
);

update public.leads set created_at = now() - interval '6 days' where id = (select lead_id from first_lead);
select is(
  (select is_new from public.create_or_attach_lead('passport', 'Ama', '+233240001001', 'Morning', 7, 1)),
  false,
  'a 6-day-old lead still attaches'
);

update public.leads set created_at = now() - interval '8 days' where id = (select lead_id from first_lead);
select is(
  (select is_new from public.create_or_attach_lead('passport', 'Ama', '+233240001001', 'Morning', 7, 1)),
  true,
  'after 7 days a new lead is created'
);

-- Unowned service ----------------------------------------------------------------
update public.services set owner_id = null where key = 'exams';
create temporary table unowned as
select * from public.create_or_attach_lead('exams', 'Kofi', '+233240001002', 'Morning', 3, 1);
select is(
  (select owner_id from public.leads where id = (select lead_id from unowned)),
  null,
  'a service with no owner leaves the lead unassigned'
);
select results_eq(
  $$ select channel::text from public.notifications where lead_id = (select lead_id from unowned) $$,
  $$ values ('sms'::text) $$,
  'with no owner only the SMS is enqueued'
);

update public.services set owner_id = '00000000-0000-4000-8000-000000000005' where key = 'exams';
update public.staff set is_active = false where id = '00000000-0000-4000-8000-000000000005';
select is(
  (select owner_id from public.leads where id = (select lead_id from public.create_or_attach_lead('exams', 'Esi', '+233240001003', 'Morning', 3, 1))),
  null,
  'a disabled owner gets no new leads'
);
update public.staff set is_active = true where id = '00000000-0000-4000-8000-000000000005';

-- save_lead_step -----------------------------------------------------------------
select lives_ok(
  format($$ select * from public.save_lead_step(%L, 0, 'start', '{"package": "Standard"}', null, null, null, 'ignored') $$, (select lead_id from second_lead)),
  'step 1 saves'
);
select results_eq(
  format($$ select steps_completed, is_partial, utm_source from public.leads where id = %L $$, (select lead_id from second_lead)),
  $$ values (1, true, 'tiktok'::text) $$,
  'one step of seven is partial, and first-touch attribution is kept'
);

select lives_ok(
  format($$ select * from public.save_lead_step(%L, 0, 'start', '{"package": "Express"}') $$, (select lead_id from second_lead)),
  'saving a step again works'
);
select is(
  (select count(*)::int from public.lead_steps where lead_id = (select lead_id from second_lead)),
  1,
  'a step is upserted, not duplicated'
);
select is(
  (select answers ->> 'package' from public.lead_steps where lead_id = (select lead_id from second_lead)),
  'Express',
  'the latest answers win'
);
select is(
  (select steps_completed from public.leads where id = (select lead_id from second_lead)),
  1,
  'going back and saving an earlier step does not lower progress'
);

select lives_ok(
  format($$ select * from public.save_lead_step(%L, 3, 'education', '{}', 'TikTok LIVE') $$, (select lead_id from second_lead)),
  'a later step saves with heard_from'
);
select results_eq(
  format($$ select steps_completed, is_partial, heard_from from public.leads where id = %L $$, (select lead_id from second_lead)),
  $$ values (4, true, 'TikTok LIVE'::text) $$,
  'progress and heard_from update'
);
select throws_ok(
  format($$ select * from public.save_lead_step(%L, 7, 'nope', '{}') $$, (select lead_id from second_lead)),
  '22023', null, 'a step past the end of the form is refused'
);
select throws_ok(
  $$ select * from public.save_lead_step('99999999-0000-4000-8000-000000000000', 0, 'start', '{}') $$,
  'P0002', null, 'an unknown lead is refused'
);

select lives_ok(
  format($$ select * from public.save_lead_step(%L, 6, 'review', '{}') $$, (select lead_id from second_lead)),
  'the last step saves'
);
select results_eq(
  format($$ select steps_completed, is_partial from public.leads where id = %L $$, (select lead_id from second_lead)),
  $$ values (7, false) $$,
  'the last step clears is_partial'
);
select lives_ok(
  format($$ select * from public.save_lead_step(%L, 6, 'review', '{}') $$, (select lead_id from second_lead)),
  'saving the last step twice works'
);
select is(
  (select count(*)::int from public.lead_events where lead_id = (select lead_id from second_lead) and type = 'completed'),
  1,
  'completed is written once'
);
select ok(
  (select count(*) >= 4 from public.lead_events where lead_id = (select lead_id from second_lead) and type = 'step_saved'),
  'each save is on the timeline'
);

-- Rate limits --------------------------------------------------------------------
select is(public.check_rate_limit('test', 'ip-1', 2, interval '10 minutes'), true, 'first hit is allowed');
select is(public.check_rate_limit('test', 'ip-1', 2, interval '10 minutes'), true, 'second hit is allowed');
select is(public.check_rate_limit('test', 'ip-1', 2, interval '10 minutes'), false, 'third hit is blocked');
select is(public.check_rate_limit('test', 'ip-2', 2, interval '10 minutes'), true, 'another key has its own count');
select is(public.check_rate_limit('other', 'ip-1', 2, interval '10 minutes'), true, 'another scope has its own count');
select is(
  (select count(*)::int from public.rate_limits where key_hash like '%ip-1%'),
  0,
  'keys are stored hashed'
);
update public.rate_limits set created_at = now() - interval '11 minutes' where scope = 'test';
select is(public.check_rate_limit('test', 'ip-1', 2, interval '10 minutes'), true, 'the window expires');

-- Privileges ---------------------------------------------------------------------
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';

select throws_ok($$ select * from public.leads $$, '42501', null, 'anon still cannot read leads');
select throws_ok($$ select * from public.rate_limits $$, '42501', null, 'anon cannot read rate_limits');
select throws_ok(
  $$ select * from public.create_or_attach_lead('passport', 'Bot', '+233240009999', 'Now', 7, 1) $$,
  '42501', null, 'anon cannot create a lead'
);
select throws_ok(
  $$ select * from public.save_lead_step('99999999-0000-4000-8000-000000000000', 0, 'x', '{}') $$,
  '42501', null, 'anon cannot save a step'
);
select throws_ok(
  $$ select public.check_rate_limit('x', 'y', 1, interval '1 minute') $$,
  '42501', null, 'anon cannot touch rate limits'
);

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated", "aal": "aal2"}';

select throws_ok(
  $$ select * from public.create_or_attach_lead('passport', 'Staff', '+233240009998', 'Now', 7, 1) $$,
  '42501', null, 'even an admin session cannot call it: service role only'
);
select throws_ok($$ select * from public.rate_limits $$, '42501', null, 'staff cannot read rate_limits');

reset role;

select * from finish();
rollback;
