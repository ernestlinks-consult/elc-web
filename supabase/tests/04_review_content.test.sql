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

insert into public.posts (id, slug, title, category, publish_state)
values
  ('10000000-0000-4000-8000-000000000001', 'live-post', 'Live', 'exams', 'published'),
  ('10000000-0000-4000-8000-000000000002', 'draft-post', 'Draft', 'exams', 'draft'),
  ('10000000-0000-4000-8000-000000000007', 'review-post', 'Review', 'exams', 'in_review');
insert into public.programmes (id, kind, country, title, keyword, correct_as_of, publish_state)
values ('10000000-0000-4000-8000-000000000003', 'study', 'Malta', 'Live', 'TEST', '2026-11-01', 'published');
insert into public.openings (id, country, title, keyword, correct_as_of, publish_state)
values ('10000000-0000-4000-8000-000000000004', 'UAE', 'Live', 'TEST', '2026-11-01', 'published');

-- Peace: post and programme ---------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000005", "role": "authenticated"}';

select is(tests.affected($$ update public.posts set publish_state = 'draft' where slug = 'live-post' $$), 0, 'editor cannot unpublish a post');
select is(tests.affected($$ update public.posts set publish_state = 'archived' where slug = 'live-post' $$), 0, 'editor cannot archive a published post');
select is(tests.affected($$ update public.posts set title = 'Edited' where slug = 'live-post' $$), 0, 'editor cannot edit a published post');
select is(tests.affected($$ delete from public.posts where slug = 'live-post' $$), 0, 'editor cannot delete a published post');
select is(tests.affected($$ update public.programmes set publish_state = 'draft' where id = '10000000-0000-4000-8000-000000000003' $$), 0, 'editor cannot unpublish a programme');
select is(tests.affected($$ update public.programmes set publish_state = 'archived' where id = '10000000-0000-4000-8000-000000000003' $$), 0, 'editor cannot archive a published programme');
select is(tests.affected($$ delete from public.programmes where id = '10000000-0000-4000-8000-000000000003' $$), 0, 'editor cannot delete a published programme');

select is(tests.affected($$ update public.posts set title = 'Edited' where slug = 'draft-post' $$), 1, 'editor still edits a draft');
select is(tests.affected($$ update public.posts set publish_state = 'in_review' where slug = 'draft-post' $$), 1, 'editor still sends a draft for review');
select is(tests.affected($$ update public.posts set publish_state = 'draft' where slug = 'draft-post' $$), 1, 'editor can pull a post back from review');
select is(tests.affected($$ delete from public.posts where slug = 'draft-post' $$), 1, 'editor can delete a draft');
select is((select count(*)::int from public.posts where slug = 'review-post'), 1, 'editor still reads in-review posts');
select lives_ok(
  $$ insert into public.posts (slug, title, category, publish_state) values ('new-post', 'New', 'exams', 'draft') $$,
  'editor still creates drafts'
);

reset role;

-- Nathaniel: opening -----------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000006", "role": "authenticated"}';

select is(tests.affected($$ update public.openings set publish_state = 'draft' where id = '10000000-0000-4000-8000-000000000004' $$), 0, 'editor cannot unpublish an opening');
select is(tests.affected($$ update public.openings set publish_state = 'archived' where id = '10000000-0000-4000-8000-000000000004' $$), 0, 'editor cannot archive a published opening');
select is(tests.affected($$ delete from public.openings where id = '10000000-0000-4000-8000-000000000004' $$), 0, 'editor cannot delete a published opening');

reset role;

-- Ernest: admin ----------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub": "00000000-0000-4000-8000-000000000001", "role": "authenticated", "aal": "aal2"}';

select is(tests.affected($$ update public.posts set publish_state = 'archived' where slug = 'live-post' $$), 1, 'admin archives a published post');
select is(tests.affected($$ update public.programmes set publish_state = 'draft' where id = '10000000-0000-4000-8000-000000000003' $$), 1, 'admin unpublishes a programme');
select is(tests.affected($$ delete from public.openings where id = '10000000-0000-4000-8000-000000000004' $$), 1, 'admin deletes a published opening');

reset role;

select * from finish();
rollback;
