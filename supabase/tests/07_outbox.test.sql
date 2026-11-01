begin;
select * from no_plan();

create temporary table lead as
select * from public.create_or_attach_lead('passport', 'Ama Mensah', '+233240003001', 'Morning', 7, 1);

select lead_id as id from lead \gset lead_

-- Enqueue --------------------------------------------------------------------
select results_eq(
  format($$ select template from public.notifications where lead_id = %L order by template $$, :'lead_id'),
  $$ values ('email.owner_new_lead'::text), ('sms.lead_ack'::text) $$,
  'a new lead enqueues the two templates'
);
select is(
  (select idempotency_key from public.notifications where lead_id = :'lead_id' and channel = 'sms'),
  'lead:' || :'lead_id' || ':sms.lead_ack:v1',
  'the key is lead + template + version'
);
select ok(
  (select send_after > now() from public.notifications where lead_id = :'lead_id' and channel = 'email'),
  'the owner email waits a moment for step 1 answers'
);
select throws_ok(
  format(
    $$ insert into public.notifications (lead_id, channel, to_address, template, idempotency_key)
       values (%L, 'sms', '+233240003001', 'sms.lead_ack', 'lead:' || %L || ':sms.lead_ack:v1') $$,
    :'lead_id', :'lead_id'
  ),
  '23505', null, 'the same notification cannot be queued twice'
);

-- Claiming -------------------------------------------------------------------
create temporary table first_claim as select * from public.claim_notifications(20);

select is((select count(*)::int from first_claim), 1, 'only rows due now are claimed');
select is((select template from first_claim), 'sms.lead_ack', 'the SMS is due straight away');
select is(
  (select status::text from public.notifications where id = (select id from first_claim)),
  'sending',
  'a claimed row is marked sending'
);
select is(
  (select count(*)::int from public.claim_notifications(20)),
  0,
  'a claimed row cannot be claimed again'
);

select id as id from first_claim \gset sms_

-- Success --------------------------------------------------------------------
select is(public.record_notification_sent(:'sms_id', 'provider-1'), true, 'a held row is marked sent');
select results_eq(
  format($$ select status::text, provider_id, attempts, sent_at is not null from public.notifications where id = %L $$, :'sms_id'),
  $$ values ('sent'::text, 'provider-1'::text, 1, true) $$,
  'sent rows keep the provider id and time'
);
select results_eq(
  format($$ select type::text, data ->> 'template' from public.lead_events where lead_id = %L and type = 'sms_sent' $$, :'lead_id'),
  $$ values ('sms_sent'::text, 'sms.lead_ack'::text) $$,
  'sms_sent is on the timeline'
);
select is(public.record_notification_sent(:'sms_id', 'provider-2'), false, 'marking it again does nothing');
select is(
  (select count(*)::int from public.lead_events where lead_id = :'lead_id' and type = 'sms_sent'),
  1,
  'no second timeline event'
);
select is(
  (select count(*)::int from public.claim_notifications(20)),
  0,
  'a sent row is never claimed again'
);

-- Email ----------------------------------------------------------------------
update public.notifications set send_after = now() where lead_id = :'lead_id' and channel = 'email';
select id as id from public.claim_notifications(20) \gset email_
select public.record_notification_sent(:'email_id', 'provider-3');
select is(
  (select count(*)::int from public.lead_events where lead_id = :'lead_id' and type = 'email_sent'),
  1,
  'email_sent is on the timeline'
);

-- Retries --------------------------------------------------------------------
create temporary table retry_lead as
select * from public.create_or_attach_lead('visa', 'Kofi Boateng', '+233240003002', 'Morning', 4, 1);
select lead_id as id from retry_lead \gset retry_
select id as id from public.notifications where lead_id = :'retry_id' and channel = 'sms' \gset retry_sms_

select id from public.claim_notifications(20);
select is(
  public.record_notification_failure(:'retry_sms_id', 'Provider down', 2)::text,
  'pending',
  'the first failure goes back in the queue'
);
select results_eq(
  format($$ select attempts, last_error, status::text from public.notifications where id = %L $$, :'retry_sms_id'),
  $$ values (1, 'Provider down'::text, 'pending'::text) $$,
  'it records the attempt and error'
);
select ok(
  (select send_after between now() + interval '119 seconds' and now() + interval '121 seconds'
   from public.notifications where id = :'retry_sms_id'),
  'it waits the minutes the worker asked for'
);
select is(
  (select count(*)::int from public.claim_notifications(20) where id = :'retry_sms_id'),
  0,
  'it is not claimed before send_after'
);

create function pg_temp.fail_once(p_id uuid) returns text language plpgsql as $$
begin
  update public.notifications set send_after = now() where id = p_id;
  perform public.claim_notifications(20);
  return public.record_notification_failure(p_id, 'Provider down', 2)::text;
end;
$$;

select is(pg_temp.fail_once(:'retry_sms_id'), 'pending', 'attempt 2 retries');
select is(pg_temp.fail_once(:'retry_sms_id'), 'pending', 'attempt 3 retries');
select is(pg_temp.fail_once(:'retry_sms_id'), 'pending', 'attempt 4 retries');
select is(pg_temp.fail_once(:'retry_sms_id'), 'pending', 'attempt 5 retries');
select is(
  (select count(*)::int from public.notifications where lead_id = :'retry_id' and template = 'email.owner_sms_failed'),
  0,
  'no failure email while retries remain'
);
select is(pg_temp.fail_once(:'retry_sms_id'), 'failed', 'attempt 6 gives up');
select results_eq(
  format($$ select status::text, attempts from public.notifications where id = %L $$, :'retry_sms_id'),
  $$ values ('failed'::text, 6) $$,
  'six attempts, then failed'
);
select is(
  (select count(*)::int from public.claim_notifications(20) where id = :'retry_sms_id'),
  0,
  'a failed row is never claimed again'
);
select results_eq(
  format($$ select channel::text, to_address, payload ->> 'ref' from public.notifications
            where lead_id = %L and template = 'email.owner_sms_failed' $$, :'retry_id'),
  format($$ values ('email'::text, 'peace@example.test'::text, %L::text) $$, (select ref from retry_lead)),
  'the owner is told when the SMS fails for good'
);
select is(
  (select status::text from public.notifications where lead_id = :'retry_id' and template = 'email.owner_new_lead'),
  'pending',
  'the owner email is untouched by the SMS failing'
);

select is(
  public.record_notification_failure('99999999-0000-4000-8000-000000000000', 'x', 2),
  null::public.notify_status,
  'an unknown row is ignored'
);

-- Unknown template gives up at once --------------------------------------------
insert into public.notifications (id, channel, to_address, template, idempotency_key)
values ('50000000-0000-4000-8000-000000000001', 'sms', '+233240003003', 'nope', 'test:nope');
select public.claim_notifications(20);
select is(
  public.record_notification_failure('50000000-0000-4000-8000-000000000001', 'Unknown template', null)::text,
  'failed',
  'no retry minutes means give up now'
);

-- Stuck rows -------------------------------------------------------------------
insert into public.notifications (id, channel, to_address, template, idempotency_key, status, claimed_at)
values ('50000000-0000-4000-8000-000000000002', 'sms', '+233240003004', 'sms.lead_ack', 'test:stuck', 'sending', now() - interval '11 minutes');
select public.claim_notifications(20);
select results_eq(
  $$ select status::text, last_error like 'Worker stopped%' from public.notifications where idempotency_key = 'test:stuck' $$,
  $$ values ('failed'::text, true) $$,
  'a row left sending is failed, never resent'
);

-- Contact messages ---------------------------------------------------------------
insert into public.messages (id, full_name, whatsapp, topic, body, consent_at)
values ('60000000-0000-4000-8000-000000000001', 'Esi', '+233240003005', 'Partnership', 'Hello', now());
select results_eq(
  $$ select to_address, template, status::text from public.notifications
     where idempotency_key = 'message:60000000-0000-4000-8000-000000000001:email.message_received:v1' $$,
  $$ values ('priscilla@example.test'::text, 'email.message_received'::text, 'pending'::text) $$,
  'a contact message enqueues an email to the front desk address in settings'
);

-- Subscribers --------------------------------------------------------------------
insert into public.subscribers (whatsapp, consent_at)
values ('+233240003006', now()), ('+233240003007', now());
select is(public.unsubscribe('+233240003006'), true, 'unsubscribe finds the number');
select ok(
  (select unsubscribed_at is not null from public.subscribers where whatsapp = '+233240003006'),
  'it records when'
);
select is(public.unsubscribe('+233240003006'), false, 'a second call changes nothing');
select is(public.unsubscribe('+233240009999'), false, 'an unknown number is fine');
select is(
  (select count(*)::int from public.subscribers_active where whatsapp = '+233240003006'),
  0,
  'an unsubscribed number is not in subscribers_active'
);
select is(
  (select count(*)::int from public.subscribers_active where whatsapp = '+233240003007'),
  1,
  'a subscribed number is'
);

-- Versions -----------------------------------------------------------------------
create temporary table versioned as
select * from public.create_or_attach_lead('work', 'Original', '+233240003008', 'Morning', 3, 1);
select lead_id as id from versioned \gset version_

select is((select submission from versioned), 1, 'a new lead is submission 1');
select public.save_lead_step(:'version_id', 0, 'start', '{"answer": "original"}', 'TikTok LIVE');

select is(
  (select submission from public.create_or_attach_lead('work', 'Same', '+233240003008', 'Morning', 3, 1, null, null, null, null, null, :'version_id', 1)),
  1,
  'the same session keeps its submission'
);
select is(
  (select count(*)::int from public.lead_events where lead_id = :'version_id' and type = 'resubmitted'),
  0,
  'the same session is not a resubmission'
);

create temporary table stranger as
select * from public.create_or_attach_lead('work', 'Stranger', '+233240003008', 'Morning', 3, 1);
select is((select lead_id from stranger), :'version_id'::uuid, 'another session attaches to the same lead');
select is((select submission from stranger), 2, 'and gets a new submission');
select results_eq(
  format($$ select data ->> 'submission', data ->> 'full_name' from public.lead_events
            where lead_id = %L and type = 'resubmitted' $$, :'version_id'),
  $$ values ('2'::text, 'Stranger'::text) $$,
  'resubmitted is on the timeline'
);

select public.save_lead_step(:'version_id', 0, 'start', '{"answer": "stranger"}', 'Google', null, null, null, null, null, 2);
select results_eq(
  format($$ select version, answers ->> 'answer' from public.lead_steps where lead_id = %L order by version $$, :'version_id'),
  $$ values (1, 'original'::text), (2, 'stranger'::text) $$,
  'the original answers are kept and the new ones stored beside them'
);
select results_eq(
  format($$ select version, answers ->> 'answer' from public.lead_steps_latest where lead_id = %L $$, :'version_id'),
  $$ values (2, 'stranger'::text) $$,
  'lead_steps_latest shows the newest version'
);
select is(
  (select heard_from from public.leads where id = :'version_id'),
  'TikTok LIVE',
  'a later submission cannot replace heard_from'
);

select public.save_lead_step(:'version_id', 0, 'start', '{"answer": "stranger again"}', null, null, null, null, null, null, 2);
select is(
  (select count(*)::int from public.lead_steps where lead_id = :'version_id'),
  2,
  'a session re-saving its own version adds no row'
);
select is(
  (select answers ->> 'answer' from public.lead_steps where lead_id = :'version_id' and version = 1),
  'original',
  'and never touches another version'
);
select throws_ok(
  format($$ select * from public.save_lead_step(%L, 0, 'start', '{}', null, null, null, null, null, null, 9) $$, :'version_id'),
  '22023', null, 'a submission that does not exist is refused'
);

select public.save_lead_step(:'version_id', 1, 'experience', '{"answer": "second step"}', null, null, null, null, null, null, 2);
select is(
  (select count(*)::int from public.lead_steps_latest where lead_id = :'version_id'),
  2,
  'latest returns one row per step'
);

-- Cron -----------------------------------------------------------------------------
select is(
  (select schedule from cron.job where jobname = 'send-notifications'),
  '* * * * *',
  'the job runs every minute'
);
select lives_ok($$ select public.trigger_send_notifications() $$, 'with no Vault secrets it does nothing, without error');
select is(
  (select count(*)::int from net.http_request_queue),
  0,
  'and makes no request'
);

-- Privileges ------------------------------------------------------------------------
set local role anon;
set local request.jwt.claims to '{"role": "anon"}';

select throws_ok($$ select * from public.claim_notifications(1) $$, '42501', null, 'anon cannot claim');
select throws_ok($$ select public.unsubscribe('+233240003007') $$, '42501', null, 'anon cannot unsubscribe anyone');
select throws_ok($$ select * from public.subscribers_active $$, '42501', null, 'anon cannot read subscribers_active');
select throws_ok($$ select * from public.lead_steps_latest $$, '42501', null, 'anon cannot read lead_steps_latest');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated", "aal": "aal2"}';

select throws_ok($$ select * from public.claim_notifications(1) $$, '42501', null, 'staff cannot claim');
select throws_ok($$ select public.trigger_send_notifications() $$, '42501', null, 'staff cannot trigger the worker');
select ok((select count(*) >= 0 from public.lead_steps_latest), 'an admin reads lead_steps_latest');

reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000004", "role": "authenticated"}';
select is(
  (select count(*)::int from public.lead_steps_latest where lead_id = :'version_id'),
  0,
  'an editor sees no versions of another owner''s lead'
);

reset role;

select * from finish();
rollback;
