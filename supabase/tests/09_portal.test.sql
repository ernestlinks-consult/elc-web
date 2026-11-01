begin;
select * from no_plan();

create schema tests;
grant usage on schema tests to authenticated;
create function tests.affected(statement text) returns integer language plpgsql as $$
declare
  changed integer;
begin
  execute statement;
  get diagnostics changed = row_count;
  return changed;
end;
$$;
grant execute on function tests.affected(text) to authenticated;

insert into public.leads (id, ref, service_key, full_name, whatsapp, best_time, consent_at, steps_total, form_version, owner_id)
values
  ('20000000-0000-4000-8000-000000000001', 'ELC-SA-1', 'school', 'Peace Lead', '+233240007001', 'Morning', now(), 5, 1, '00000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000002', 'ELC-PP-1', 'passport', 'Grace Lead', '+233240007002', 'Morning', now(), 7, 1, '00000000-0000-4000-8000-000000000004');
insert into public.notifications (lead_id, channel, to_address, template, idempotency_key)
values
  ('20000000-0000-4000-8000-000000000001', 'sms', '+233240007001', 'sms.lead_ack', 'test:peace'),
  ('20000000-0000-4000-8000-000000000002', 'sms', '+233240007002', 'sms.lead_ack', 'test:grace');
update public.notifications set status = 'sent' where idempotency_key in ('test:peace', 'test:grace');
insert into public.notifications (channel, to_address, template, idempotency_key)
values ('email', 'desk@example.test', 'email.message_received', 'test:message');

-- Admin at aal1: nothing ------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated", "aal": "aal1"}';

select is((select public.is_admin()), false, 'an aal1 admin is not an admin');
select is((select public.staff_role()), null::public.staff_role, 'an aal1 admin has no staff role');
select is((select count(*)::int from public.leads), 0, 'an aal1 admin reads no leads');
select is((select count(*)::int from public.staff), 0, 'an aal1 admin reads no staff');
select is((select count(*)::int from public.settings), 0, 'an aal1 admin reads no settings');
select is((select count(*)::int from public.prices where never_public), 0, 'an aal1 admin reads no private prices');
select is((select count(*)::int from public.audit_log), 0, 'an aal1 admin reads no audit log');
select is(tests.affected($$ update public.prices set amount_ghs = 1 $$), 0, 'an aal1 admin cannot edit prices');
select is(tests.affected($$ update public.staff set role = 'editor' $$), 0, 'an aal1 admin cannot edit staff');
select throws_ok(
  $$ insert into public.staff_content_access (staff_id, content_type) values (auth.uid(), 'faq') $$,
  '42501', null, 'an aal1 admin cannot grant content access'
);
select results_eq(
  $$ select full_name, role::text, is_active, aal from public.my_staff_access() $$,
  $$ values ('Ernest A.'::text, 'admin'::text, true, 'aal1'::text) $$,
  'my_staff_access still tells the portal who this is, so it can ask for the code'
);
select throws_ok(
  $$ select public.resend_lead_ack('20000000-0000-4000-8000-000000000001') $$,
  '42501', null, 'an aal1 admin cannot resend'
);

reset role;

-- A token with no aal at all is treated the same.
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated"}';
select is((select public.is_admin()), false, 'an admin token with no aal is not an admin');
reset role;

-- Admin at aal2: everything ------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated", "aal": "aal2"}';

select is((select public.is_admin()), true, 'an aal2 admin is an admin');
select is((select public.staff_role()), 'admin'::public.staff_role, 'an aal2 admin has the role');
select is((select count(*)::int from public.leads), 2, 'an aal2 admin reads all leads');
select is((select count(*)::int from public.notifications where template = 'email.message_received'), 1, 'an aal2 admin reads contact notifications');
select is(tests.affected($$ update public.prices set amount_ghs = 700 where key = 'passport_standard' $$), 1, 'an aal2 admin edits prices');

reset role;

-- Other staff do not need aal2 ------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000003", "role": "authenticated", "aal": "aal1"}';

select is((select public.staff_role()), 'front_desk'::public.staff_role, 'front desk works at aal1');
select is((select count(*)::int from public.notifications), 2, 'front desk reads notifications on leads');
select is(
  (select count(*)::int from public.notifications where template = 'email.message_received'),
  0,
  'front desk reads no contact outbox rows'
);
select throws_ok($$ update public.notifications set status = 'sent' $$, '42501', null, 'front desk cannot write to the outbox');
select is((select count(*)::int from public.leads_inbox), 2, 'front desk reads the inbox');

select is(
  public.resend_lead_ack('20000000-0000-4000-8000-000000000001'),
  'queued',
  'front desk can resend'
);
select is(
  public.resend_lead_ack('20000000-0000-4000-8000-000000000001'),
  'already_queued',
  'a second press does nothing while one is waiting'
);
select is(
  (select count(*)::int from public.lead_events where lead_id = '20000000-0000-4000-8000-000000000001' and type = 'note'),
  1,
  'the resend is on the timeline with who asked'
);
reset role;

select results_eq(
  $$ select idempotency_key, status::text, to_address from public.notifications
     where lead_id = '20000000-0000-4000-8000-000000000001' and status = 'pending' $$,
  $$ values ('lead:20000000-0000-4000-8000-000000000001:sms.lead_ack:v2'::text, 'pending'::text, '+233240007001'::text) $$,
  'a resend is a new version, so the idempotency key still holds'
);

-- Editor ------------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000005", "role": "authenticated", "aal": "aal1"}';

select is((select count(*)::int from public.leads_inbox), 1, 'an editor sees only her leads in the inbox');
select is((select count(*)::int from public.leads where ref = 'ELC-PP-1'), 0, 'an editor cannot read another owner''s lead');
select is(
  (select count(*)::int from public.notifications where lead_id = '20000000-0000-4000-8000-000000000002'),
  0,
  'an editor reads no notifications on another owner''s lead'
);
select is(
  (select count(*)::int from public.notifications where lead_id = '20000000-0000-4000-8000-000000000001'),
  2,
  'an editor reads notifications on her own lead'
);
select throws_ok(
  $$ select public.resend_lead_ack('20000000-0000-4000-8000-000000000001') $$,
  '42501', null, 'an editor cannot resend'
);
reset role;

-- Disabled staff ------------------------------------------------------------------------
update public.staff set is_active = false where email in ('peace@example.test', 'ernest@example.test');

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000005", "role": "authenticated", "aal": "aal1"}';
select is((select count(*)::int from public.leads_inbox), 0, 'disabled staff see no inbox');
select is((select count(*)::int from public.notifications), 0, 'disabled staff see no notifications');
select is(
  (select is_active from public.my_staff_access()),
  false,
  'the portal can tell they are disabled'
);
reset role;

set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated", "aal": "aal2"}';
select is((select public.is_admin()), false, 'a disabled admin has no powers, even at aal2');
select is((select count(*)::int from public.leads), 0, 'a disabled admin reads no leads');
reset role;

update public.staff set is_active = true where email in ('peace@example.test', 'ernest@example.test');

-- A stranger --------------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "99999999-0000-4000-8000-000000000000", "role": "authenticated", "aal": "aal2"}';
select is((select count(*)::int from public.my_staff_access()), 0, 'a non-staff user has no access row');
select is((select count(*)::int from public.leads_inbox), 0, 'a non-staff user sees no inbox');
reset role;

-- Anon ---------------------------------------------------------------------------------------
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';
select throws_ok($$ select * from public.leads_inbox $$, '42501', null, 'anon cannot read the inbox');
select throws_ok($$ select * from public.my_staff_access() $$, '42501', null, 'anon cannot call my_staff_access');
select throws_ok($$ select public.resend_lead_ack('20000000-0000-4000-8000-000000000001') $$, '42501', null, 'anon cannot resend');
select throws_ok($$ select public.log_export('leads', '{}') $$, '42501', null, 'anon cannot write to the audit log');
reset role;

-- Working hours: Mon-Fri 08:00-17:00 Accra (UTC) -------------------------------------------------
-- 2 Nov 2026 is a Monday.
select is(public.working_minutes_between('2026-11-02 09:00+00', '2026-11-02 10:30+00'), 90, 'within one working day');
select is(public.working_minutes_between('2026-11-02 06:00+00', '2026-11-02 09:00+00'), 60, 'before opening does not count');
select is(public.working_minutes_between('2026-11-02 16:00+00', '2026-11-02 20:00+00'), 60, 'after closing does not count');
select is(public.working_minutes_between('2026-11-02 16:30+00', '2026-11-03 08:30+00'), 60, 'overnight counts only working minutes');
select is(public.working_minutes_between('2026-11-06 16:00+00', '2026-11-09 09:00+00'), 120, 'a weekend counts for nothing');
select is(public.working_minutes_between('2026-11-07 10:00+00', '2026-11-08 18:00+00'), 0, 'a lead received at the weekend waits for Monday');
select is(public.working_minutes_between('2026-11-02 20:00+00', '2026-11-02 23:00+00'), 0, 'after hours is zero');
select is(public.working_minutes_between('2026-11-02 00:00+00', '2026-11-03 00:00+00'), 540, 'a full day is nine hours');
select is(public.working_minutes_between('2026-11-02 00:00+00', '2026-11-09 00:00+00'), 2700, 'a full week is five days');
select is(public.working_minutes_between('2026-11-02 12:00+00', '2026-11-02 11:00+00'), 0, 'a reversed range is zero');

select is(public.lead_is_overdue('new', '2026-11-02 09:00+00', '2026-11-02 11:00+00'), false, 'exactly on the promise is not overdue');
select is(public.lead_is_overdue('new', '2026-11-02 09:00+00', '2026-11-02 11:01+00'), true, 'one minute past is overdue');
select is(public.lead_is_overdue('new', '2026-11-06 16:30+00', '2026-11-09 08:00+00'), false, 'Friday evening is fine on Monday at opening');
select is(public.lead_is_overdue('new', '2026-11-06 16:30+00', '2026-11-09 09:31+00'), true, 'Friday evening is overdue by mid Monday morning');
select is(public.lead_is_overdue('new', '2026-11-07 10:00+00', '2026-11-09 09:59+00'), false, 'Saturday lead has until 10:00 Monday');
select is(public.lead_is_overdue('contacted', '2026-01-01 09:00+00', '2026-11-02 11:00+00'), false, 'only New leads can be overdue');
select is(public.lead_is_overdue('closed', '2026-01-01 09:00+00', '2026-11-02 11:00+00'), false, 'closed leads are never overdue');

update public.settings set value = '30' where key = 'reply_promise_minutes';
select is(public.lead_is_overdue('new', '2026-11-02 09:00+00', '2026-11-02 09:31+00'), true, 'the promise comes from settings');

update public.settings set value = '{"days": [1, 2, 3, 4, 5, 6], "start": "09:00", "end": "13:00", "time_zone": "Africa/Accra"}' where key = 'working_hours';
select is(public.working_minutes_between('2026-11-07 00:00+00', '2026-11-08 00:00+00'), 240, 'the hours and days come from settings');

-- Timeline still records who ---------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000003", "role": "authenticated", "aal": "aal1"}';
update public.leads set status = 'contacted' where ref = 'ELC-PP-1';
reset role;
select ok(
  (select first_reply_at is not null from public.leads where ref = 'ELC-PP-1'),
  'first change from New sets first_reply_at'
);

-- Export logging ----------------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000002", "role": "authenticated", "aal": "aal2"}';
select lives_ok($$ select public.log_export('leads', '{"status": "new"}') $$, 'an admin export is logged');
reset role;
select results_eq(
  $$ select actor_id, action, table_name, after ->> 'status' from public.audit_log where action = 'export' $$,
  $$ values ('00000000-0000-4000-8000-000000000002'::uuid, 'export'::text, 'leads'::text, 'new'::text) $$,
  'the audit log records who exported and with which filters'
);

select * from finish();
rollback;
