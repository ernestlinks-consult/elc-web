begin;
select * from no_plan();

-- Runs a statement and returns how many rows it changed. RLS hides rows rather
-- than raising an error, so 0 is what a blocked UPDATE or DELETE looks like.
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

-- Fixtures. Grace (…04) has faq + programme; Peace (…05) has scholarship + post
-- + programme; Nathaniel (…06) has drive + opening.
insert into public.posts (id, slug, title, category, publish_state)
values
  ('10000000-0000-4000-8000-000000000001', 'test-draft', 'Test draft', 'exams', 'draft'),
  ('10000000-0000-4000-8000-000000000002', 'test-published', 'Test published', 'exams', 'published');
insert into public.programmes (id, kind, country, title, keyword, correct_as_of, publish_state)
values ('10000000-0000-4000-8000-000000000003', 'study', 'Malta', 'Draft programme', 'TEST', '2026-11-01', 'draft');
insert into public.openings (id, country, title, keyword, correct_as_of, publish_state)
values ('10000000-0000-4000-8000-000000000004', 'UAE', 'Draft opening', 'TEST', '2026-11-01', 'draft');
insert into public.scholarships (id, slug, name, official_url, verified_on, not_pay_to_apply, publish_state)
values ('10000000-0000-4000-8000-000000000005', 'test-scholarship', 'Draft scholarship', 'https://example.test', '2026-11-01', true, 'draft');
insert into public.faqs (id, question, answer, publish_state)
values ('10000000-0000-4000-8000-000000000006', 'Draft?', 'Draft.', 'draft');
insert into public.leads (id, ref, service_key, full_name, whatsapp, best_time, consent_at, steps_total, form_version, owner_id)
values
  ('20000000-0000-4000-8000-000000000001', 'ELC-SA-1', 'school', 'Peace Lead', '+233240000001', 'Morning', now(), 5, 1, '00000000-0000-4000-8000-000000000005'),
  ('20000000-0000-4000-8000-000000000002', 'ELC-PP-1', 'passport', 'Grace Lead', '+233240000002', 'Morning', now(), 7, 1, '00000000-0000-4000-8000-000000000004');
insert into public.lead_steps (lead_id, step_index, step_key)
values
  ('20000000-0000-4000-8000-000000000001', 0, 'contact'),
  ('20000000-0000-4000-8000-000000000002', 0, 'contact');
insert into public.messages (id, full_name, whatsapp, body, consent_at)
values ('30000000-0000-4000-8000-000000000001', 'Test', '+233240000000', 'Hello', now());
insert into public.subscribers (id, whatsapp, consent_at)
values ('30000000-0000-4000-8000-000000000002', '+233240000000', now());
insert into public.events (name) values ('form_open');

-- Front desk: Priscilla ------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000003", "role": "authenticated"}';

select is((select count(*)::int from public.posts where publish_state <> 'published'), 0, 'front desk reads no draft content');
select ok((select count(*) > 0 from public.posts), 'front desk reads published content');
select is(tests.affected($$ update public.posts set title = 'x' $$), 0, 'front desk cannot edit content');
select throws_ok(
  $$ insert into public.posts (slug, title, category) values ('x', 'x', 'exams') $$,
  '42501', null, 'front desk cannot add content'
);
select is((select count(*)::int from public.leads), 2, 'front desk reads all leads');
select is((select count(*)::int from public.lead_steps), 2, 'front desk reads all lead steps');
select is(
  tests.affected($$ update public.leads set status = 'contacted', owner_id = '00000000-0000-4000-8000-000000000006' where ref = 'ELC-PP-1' $$),
  1,
  'front desk updates status and owner'
);
select throws_ok(
  $$ update public.leads set full_name = 'Changed' where ref = 'ELC-SA-1' $$,
  '42501', null, 'front desk cannot change other lead columns'
);
select throws_ok(
  $$ update public.leads set first_reply_at = now() - interval '1 day' where ref = 'ELC-PP-1' $$,
  '42501', null, 'front desk cannot backdate first reply'
);
select is(tests.affected($$ delete from public.leads $$), 0, 'front desk cannot delete leads');
select lives_ok(
  $$ insert into public.lead_events (lead_id, type, actor_id, data)
     values ('20000000-0000-4000-8000-000000000002', 'note', '00000000-0000-4000-8000-000000000003', '{"text": "Called"}') $$,
  'front desk adds a note'
);
select throws_ok(
  $$ insert into public.lead_events (lead_id, type, actor_id)
     values ('20000000-0000-4000-8000-000000000002', 'status_changed', '00000000-0000-4000-8000-000000000003') $$,
  '42501', null, 'front desk cannot forge timeline events'
);
select throws_ok(
  $$ insert into public.lead_events (lead_id, type, actor_id)
     values ('20000000-0000-4000-8000-000000000002', 'note', '00000000-0000-4000-8000-000000000001') $$,
  '42501', null, 'front desk cannot write a note as someone else'
);
select is((select count(*)::int from public.messages), 1, 'front desk reads messages');
select is(tests.affected($$ update public.messages set status = 'handled' $$), 1, 'front desk updates messages');
select is((select count(*)::int from public.subscribers), 1, 'front desk reads subscribers');
select is(tests.affected($$ update public.subscribers set unsubscribed_at = now() $$), 1, 'front desk updates subscribers');
select is(tests.affected($$ delete from public.messages $$), 0, 'front desk cannot delete messages');
select ok((select count(*) > 0 from public.prices where never_public), 'front desk reads all prices');
select ok((select count(*) > 0 from public.settings where key = 'official_momo'), 'front desk reads all settings');
select is(tests.affected($$ update public.settings set value = '{}' $$), 0, 'front desk cannot edit settings');
select is(tests.affected($$ update public.prices set amount_ghs = 1 $$), 0, 'front desk cannot edit prices');
select is(tests.affected($$ update public.live_schedule set topic = 'x' $$), 0, 'front desk cannot edit the LIVE schedule');
select is((select count(*)::int from public.staff), 6, 'front desk reads staff');
select ok((select count(*) > 0 from public.staff where email is not null), 'front desk reads staff contact columns');
select is(tests.affected($$ update public.staff set role = 'admin' where id = auth.uid() $$), 0, 'front desk cannot promote herself');
select ok((select count(*) > 0 from public.staff_content_access), 'front desk reads staff_content_access');
select is((select count(*)::int from public.audit_log), 0, 'front desk cannot read audit_log');
select is((select count(*)::int from public.events), 0, 'front desk cannot read events');
select is((select count(*)::int from public.notifications), 0, 'front desk cannot read the outbox');
select is((select count(*)::int from public.content_comments), 0, 'front desk reads no review comments');

reset role;

-- Editor: Peace (scholarship, post, programme) --------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000005", "role": "authenticated"}';

select is((select count(*)::int from public.posts where id = '10000000-0000-4000-8000-000000000001'), 1, 'editor reads drafts of her types');
select is((select count(*)::int from public.faqs where id = '10000000-0000-4000-8000-000000000006'), 0, 'editor reads no drafts outside her types');
select is((select count(*)::int from public.openings where id = '10000000-0000-4000-8000-000000000004'), 0, 'editor reads no draft openings without access');
select is(tests.affected($$ update public.posts set title = 'Edited' where id = '10000000-0000-4000-8000-000000000001' $$), 1, 'editor edits a draft of her type');
select is(tests.affected($$ update public.faqs set answer = 'x' where id = '10000000-0000-4000-8000-000000000006' $$), 0, 'editor cannot edit outside her types');
select lives_ok(
  $$ update public.posts set publish_state = 'in_review' where id = '10000000-0000-4000-8000-000000000001' $$,
  'editor sends a post for review'
);
select throws_ok(
  $$ update public.posts set publish_state = 'published' where id = '10000000-0000-4000-8000-000000000001' $$,
  '42501', null, 'editor cannot publish a post'
);
select throws_ok(
  $$ insert into public.posts (slug, title, category, publish_state) values ('x', 'x', 'exams', 'published') $$,
  '42501', null, 'editor cannot create a published post'
);
select throws_ok(
  $$ update public.programmes set publish_state = 'published' where id = '10000000-0000-4000-8000-000000000003' $$,
  '42501', null, 'editor cannot publish a programme'
);
select lives_ok(
  $$ update public.scholarships set publish_state = 'published' where id = '10000000-0000-4000-8000-000000000005' $$,
  'editor can publish a scholarship, which has no review step'
);
select is((select count(*)::int from public.leads), 1, 'editor reads only the leads she owns');
select is((select count(*)::int from public.lead_steps), 1, 'editor reads only steps of her leads');
select is(tests.affected($$ update public.leads set status = 'started' where ref = 'ELC-PP-1' $$), 0, 'editor cannot update another owner''s lead');
select is(tests.affected($$ delete from public.leads $$), 0, 'editor cannot delete leads');
select lives_ok(
  $$ insert into public.lead_events (lead_id, type, actor_id)
     values ('20000000-0000-4000-8000-000000000001', 'note', '00000000-0000-4000-8000-000000000005') $$,
  'editor adds a note to her lead'
);
select throws_ok(
  $$ insert into public.lead_events (lead_id, type, actor_id)
     values ('20000000-0000-4000-8000-000000000002', 'note', '00000000-0000-4000-8000-000000000005') $$,
  '42501', null, 'editor cannot add a note to another owner''s lead'
);
select is((select count(*)::int from public.messages), 0, 'editor reads no messages');
select is((select count(*)::int from public.subscribers), 0, 'editor reads no subscribers');
select ok((select count(*) > 0 from public.prices where never_public), 'editor reads all prices');
select is(tests.affected($$ update public.prices set amount_ghs = 1 $$), 0, 'editor cannot edit prices');
select is(tests.affected($$ update public.settings set value = '{}' $$), 0, 'editor cannot edit settings');
select is((select count(*)::int from public.staff), 6, 'editor reads staff');
select is(tests.affected($$ update public.staff set role = 'admin' $$), 0, 'editor cannot edit staff');
select is(
  tests.affected($$ delete from public.staff_content_access $$),
  0,
  'editor cannot change content access'
);
select throws_ok(
  $$ insert into public.staff_content_access (staff_id, content_type) values (auth.uid(), 'faq') $$,
  '42501', null, 'editor cannot grant herself a content type'
);
select is((select count(*)::int from public.audit_log), 0, 'editor cannot read audit_log');
select is((select count(*)::int from public.events), 0, 'editor cannot read events');

-- Editor: Grace also has programme, but no post --------------------------------
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000004", "role": "authenticated"}';

select is((select count(*)::int from public.posts where id = '10000000-0000-4000-8000-000000000001'), 0, 'an editor without post access reads no draft posts');
select is(tests.affected($$ update public.faqs set answer = 'Edited' where id = '10000000-0000-4000-8000-000000000006' $$), 1, 'Grace edits FAQs');
select lives_ok(
  $$ update public.faqs set publish_state = 'published' where id = '10000000-0000-4000-8000-000000000006' $$,
  'an editor with faq access can publish an FAQ'
);

-- Editor: Nathaniel has opening --------------------------------------------------
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000006", "role": "authenticated"}';

select throws_ok(
  $$ update public.openings set publish_state = 'published' where id = '10000000-0000-4000-8000-000000000004' $$,
  '42501', null, 'editor cannot publish an opening'
);

-- Admin: Ernest ------------------------------------------------------------------
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated"}';

select is(
  tests.affected($$ update public.posts set publish_state = 'published' where id = '10000000-0000-4000-8000-000000000001' $$),
  1,
  'admin publishes a post'
);
select is(
  tests.affected($$ update public.programmes set publish_state = 'published' where id = '10000000-0000-4000-8000-000000000003' $$),
  1,
  'admin publishes a programme'
);
select is(
  tests.affected($$ update public.openings set publish_state = 'published' where id = '10000000-0000-4000-8000-000000000004' $$),
  1,
  'admin publishes an opening'
);
select is((select count(*)::int from public.leads), 2, 'admin reads all leads');
select is(tests.affected($$ update public.leads set full_name = 'Fixed' where ref = 'ELC-SA-1' $$), 1, 'admin edits any lead column');
select is(tests.affected($$ update public.prices set amount_ghs = 650 where key = 'passport_standard' $$), 1, 'admin edits prices');
select is(tests.affected($$ update public.settings set updated_by = auth.uid() where key = 'hours' $$), 1, 'admin edits settings');
select is(tests.affected($$ update public.live_schedule set topic = 'Test' where weekday = 1 $$), 1, 'admin edits the LIVE schedule');
select is(tests.affected($$ update public.staff set bio = 'Test' where email = 'grace@example.test' $$), 1, 'admin edits staff');
select lives_ok(
  $$ insert into public.staff_content_access (staff_id, content_type)
     values ('00000000-0000-4000-8000-000000000004', 'post') $$,
  'admin changes content access'
);
select ok((select count(*) > 0 from public.audit_log), 'admin reads audit_log');
select ok((select count(*) > 0 from public.events), 'admin reads events');
select throws_ok($$ delete from public.audit_log $$, '42501', null, 'not even an admin can delete audit_log rows');
select throws_ok($$ update public.audit_log set action = 'delete' $$, '42501', null, 'not even an admin can edit audit_log rows');

-- Disabled staff lose access immediately (P-01) ------------------------------------
reset role;
update public.staff set is_active = false where email = 'priscilla@example.test';
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000003", "role": "authenticated"}';

select is((select count(*)::int from public.leads), 0, 'disabled staff read no leads');
select is((select count(*)::int from public.staff), 0, 'disabled staff read no staff contact details');
select is((select count(*)::int from public.prices), 0, 'disabled staff read no private prices');
select is((select count(*)::int from public.programmes), 0, 'disabled staff read no internal school names');

reset role;

-- A signed-in stranger is not staff ------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "99999999-0000-4000-8000-000000000000", "role": "authenticated"}';

select is((select public.staff_role()), null::public.staff_role, 'a stranger has no staff role');
select is((select count(*)::int from public.staff), 0, 'a stranger reads no staff rows');
select is((select count(*)::int from public.leads), 0, 'a stranger reads no leads');

reset role;

select * from finish();
rollback;
