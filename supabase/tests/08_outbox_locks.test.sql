-- SKIP LOCKED needs a row really locked by another connection, so the extension
-- and that connection live outside the test transaction.
create extension if not exists dblink with schema extensions;

select extensions.dblink_connect('holder', format('host=%s port=5432 dbname=postgres user=postgres password=postgres', host(inet_server_addr())));

-- Committed by the other connection so this session can see them.
select extensions.dblink_exec('holder', $$
  insert into public.notifications (id, channel, to_address, template, idempotency_key, send_after)
  values
    ('70000000-0000-4000-8000-000000000001', 'sms', '+233240004001', 'sms.lead_ack', 'test:locked', now() - interval '1 minute'),
    ('70000000-0000-4000-8000-000000000002', 'sms', '+233240004002', 'sms.lead_ack', 'test:free', now() - interval '1 minute')
$$);

select extensions.dblink_exec('holder', 'begin');
select * from extensions.dblink('holder', $$
  select id from public.notifications where idempotency_key = 'test:locked' for update
$$) as result (id uuid);

begin;
select * from no_plan();

select results_eq(
  $$ select idempotency_key from public.claim_notifications(20) $$,
  $$ values ('test:free'::text) $$,
  'a worker skips a row another worker holds'
);

select extensions.dblink_exec('holder', 'commit');

select results_eq(
  $$ select idempotency_key from public.claim_notifications(20) $$,
  $$ values ('test:locked'::text) $$,
  'once released, the row is claimed as normal'
);

select * from finish();
rollback;

select extensions.dblink_exec('holder', $$ delete from public.notifications where idempotency_key in ('test:locked', 'test:free') $$);
select extensions.dblink_disconnect('holder');
drop extension dblink;
