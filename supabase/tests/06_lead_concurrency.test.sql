-- Two real connections, so this cannot run inside one test transaction. The
-- first call holds its transaction open; the second must wait on the advisory
-- lock, then attach. Without the lock it would insert a second lead.
begin;
select * from no_plan();

create extension if not exists dblink with schema extensions;

-- The server's network address, not 127.0.0.1: dblink needs password sign-in,
-- and local connections here are trusted without one.
select extensions.dblink_connect(name, format('host=%s port=5432 dbname=postgres user=postgres password=postgres', host(inet_server_addr())))
from (values ('first'), ('second')) as connection (name);

select extensions.dblink_exec('first', 'begin');
create temporary table first_call as
select * from extensions.dblink(
  'first',
  $$ select lead_id, ref, is_new from public.create_or_attach_lead('passport', 'Race One', '+233240002001', 'Morning', 7, 1) $$
) as result (lead_id uuid, ref text, is_new boolean);

select is((select is_new from first_call), true, 'the first call creates the lead');

select is(
  extensions.dblink_send_query(
    'second',
    $$ select lead_id, ref, is_new from public.create_or_attach_lead('passport', 'Race Two', '+233240002001', 'Morning', 7, 1) $$
  ),
  1,
  'the second call starts'
);

select pg_sleep(0.5);
select is(extensions.dblink_is_busy('second'), 1, 'the second call waits on the lock');

select extensions.dblink_exec('first', 'commit');

create temporary table second_call as
select * from extensions.dblink_get_result('second') as result (lead_id uuid, ref text, is_new boolean);

select is((select is_new from second_call), false, 'the second call attaches');
select is((select lead_id from second_call), (select lead_id from first_call), 'both calls return the same lead');

select results_eq(
  $$ select * from extensions.dblink(
       'first',
       $q$ select count(*)::int from public.leads where whatsapp = '+233240002001' $q$
     ) as result (leads integer) $$,
  $$ values (1) $$,
  'exactly one lead exists'
);
select results_eq(
  $$ select * from extensions.dblink(
       'first',
       $q$ select count(*)::int from public.notifications where to_address = '+233240002001' $q$
     ) as result (messages integer) $$,
  $$ values (1) $$,
  'exactly one SMS is enqueued'
);

-- These rows were really committed, so remove them.
select extensions.dblink_exec(
  'first',
  format(
    $$ delete from public.leads where id = %L $$,
    (select lead_id from first_call)
  )
);
select extensions.dblink_exec(
  'first',
  format($$ delete from public.audit_log where table_name = 'leads' and row_id = %L $$, (select lead_id::text from first_call))
);
select extensions.dblink_disconnect('first');
select extensions.dblink_disconnect('second');

select * from finish();
rollback;
