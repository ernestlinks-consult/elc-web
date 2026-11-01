-- LOCAL AND STAGING ONLY. NEVER APPLY TO PRODUCTION.
--
-- Creates six fake sign-ins with a shared, published password, plus sample
-- content. Anything marked [Sample] or [PLACEHOLDER] is not real ELC data.
-- Contact details and prices match lib/site-config.ts and CLAUDE.md; keep them
-- in step. Only db:reset runs this file.

do $$
begin
  if exists (select 1 from auth.users where email not like '%@example.test') then
    raise exception 'seed.sql refused: this database has real users. It is for local and staging only.';
  end if;
end;
$$;

-- Staff ---------------------------------------------------------------------
-- Development password for all six: ELC-local-dev-2026!

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
select
  '00000000-0000-0000-0000-000000000000', person.id::uuid, 'authenticated', 'authenticated',
  person.email, extensions.crypt('ELC-local-dev-2026!', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
  '', '', '', ''
from (values
  ('00000000-0000-4000-8000-000000000001', 'ernest@example.test'),
  ('00000000-0000-4000-8000-000000000002', 'godfred@example.test'),
  ('00000000-0000-4000-8000-000000000003', 'priscilla@example.test'),
  ('00000000-0000-4000-8000-000000000004', 'grace@example.test'),
  ('00000000-0000-4000-8000-000000000005', 'peace@example.test'),
  ('00000000-0000-4000-8000-000000000006', 'nathaniel@example.test')
) as person (id, email);

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u;

insert into public.staff (id, full_name, title, role, email, is_active, show_on_site, sort_order)
values
  ('00000000-0000-4000-8000-000000000001', 'Ernest A.', 'Chief Executive Officer', 'admin', 'ernest@example.test', true, true, 1),
  ('00000000-0000-4000-8000-000000000002', 'Godfred A.', 'Managing Director, Growth and Strategy', 'admin', 'godfred@example.test', true, true, 2),
  ('00000000-0000-4000-8000-000000000003', 'Priscilla A.', 'Administrative Assistant', 'front_desk', 'priscilla@example.test', true, true, 3),
  ('00000000-0000-4000-8000-000000000004', 'Grace Y.', 'Programs and Documentation Officer', 'editor', 'grace@example.test', true, true, 4),
  ('00000000-0000-4000-8000-000000000005', 'Peace A.', 'Study Abroad Counsellor', 'editor', 'peace@example.test', true, true, 5),
  ('00000000-0000-4000-8000-000000000006', 'Nathaniel A.', 'Outreach Lead', 'editor', 'nathaniel@example.test', true, true, 6);

-- PRD section 2, proposed defaults.
insert into public.staff_content_access (staff_id, content_type)
values
  ('00000000-0000-4000-8000-000000000005', 'scholarship'),
  ('00000000-0000-4000-8000-000000000005', 'post'),
  ('00000000-0000-4000-8000-000000000005', 'programme'),
  ('00000000-0000-4000-8000-000000000004', 'faq'),
  ('00000000-0000-4000-8000-000000000004', 'programme'),
  ('00000000-0000-4000-8000-000000000006', 'drive'),
  ('00000000-0000-4000-8000-000000000006', 'opening');

-- Services ------------------------------------------------------------------
-- Owners are the PRD's proposed defaults; the final owner per service is still
-- an open question for ELC.

insert into public.services (key, name, slug, ref_prefix, owner_id, whatsapp_keyword, short_description, sort_order)
values
  ('passport', 'Passports & birth certificates', 'passports', 'PP', '00000000-0000-4000-8000-000000000004', 'PASSPORT', 'New, renewal, express, mass drives', 1),
  ('birth', 'Birth certificates', 'birth-certificates', 'BC', '00000000-0000-4000-8000-000000000004', 'BIRTH CERT', 'Biometric birth certificates', 2),
  ('school', 'School applications', 'school-applications', 'SA', '00000000-0000-4000-8000-000000000005', 'STUDY', 'Choosing, applying, offers, funding', 3),
  ('visa', 'Visa applications', 'visa-applications', 'VS', '00000000-0000-4000-8000-000000000005', 'VISA', 'Study, work and tourist visas', 4),
  ('work', 'Work abroad', 'work-abroad', 'WA', '00000000-0000-4000-8000-000000000006', 'WORK', 'Verified openings and bridging programmes', 5),
  ('exams', 'Proficiency exams', 'exams', 'EX', '00000000-0000-4000-8000-000000000004', 'EXAMS', 'Registration and tuition', 6),
  ('travel', 'Travel & tours', 'travel', 'TR', '00000000-0000-4000-8000-000000000003', 'TRAVEL', 'Flights, hotels, conferences', 7);

-- Settings ------------------------------------------------------------------

insert into public.settings (key, value)
values
  ('contacts', $json$
    {
      "phones": [
        {"display": "+233 53 778 3166", "tel": "+233537783166"},
        {"display": "+233 20 401 0168", "tel": "+233204010168"}
      ],
      "hotline": {"display": "032 229 1161", "tel": "+233322291161"},
      "whatsapp_number": "+233537783166",
      "whatsapp_default_message": "HELLO",
      "whatsapp_channel_url": "https://whatsapp.com/channel/0029VastSo8DTkK2lkyUSY0g",
      "email": "office@ernestlinksconsult.com"
    }
  $json$),
  ('hours', $json$
    {
      "office": "Mon–Fri, 8:00–17:00",
      "ceo_consultations": "CEO consultations Mon & Wed, 10:30–14:30"
    }
  $json$),
  ('offices', $json$
    [
      {
        "name": "Ayeduase, KNUST Engineering Gate office",
        "address": "Ayeduase Gate, Kumasi",
        "map_url": "https://share.google/aOoUoDOERXanDgkHx"
      },
      {
        "name": "Kotei Astro Turf office",
        "address": "Kotei Astro Turf, next to Unik Pub, Kumasi",
        "map_url": "https://share.google/kju8X4z7czM9tZf0y"
      }
    ]
  $json$),
  ('socials', $json$
    [
      {"label": "TikTok", "url": "https://www.tiktok.com/@_ernestlinksconsult"},
      {"label": "Instagram", "url": "https://www.instagram.com/_ernestlinksconsult/"},
      {"label": "Facebook", "url": "https://web.facebook.com/profile.php?id=61576608208326"},
      {"label": "YouTube", "url": "https://www.youtube.com/@ErnestLinksConsult"},
      {"label": "X", "url": "https://x.com/Ernestlinkscons"},
      {"label": "LinkedIn", "url": "https://www.linkedin.com/company/ernestlinksconsult/"}
    ]
  $json$),
  ('live_note', $json$
    {
      "note": "Weekdays, 12–2pm on TikTok LIVE",
      "url": "https://www.tiktok.com/@_ernestlinksconsult",
      "host_rotation": "A different host each weekday"
    }
  $json$),
  ('booking_url', '"https://ernest-links-frontend.vercel.app/book"'),
  ('passport_what_to_bring', '["Ghana Card", "Birth certificate", "Old passport, for renewals", "[PLACEHOLDER: final list, waiting on ELC]"]'),
  ('front_desk_email', '"priscilla@example.test"'),
  ('reply_promise_minutes', '120'),
  ('working_hours', '{"days": [1, 2, 3, 4, 5], "start": "08:00", "end": "17:00", "time_zone": "Africa/Accra"}'),
  ('reply_promise', '"[PLACEHOLDER: reply-time promise, waiting on ELC]"'),
  ('official_momo', '{"name": "[PLACEHOLDER: official MoMo name, waiting on ELC]", "number": "[PLACEHOLDER: official MoMo number, waiting on ELC]"}');

-- Prices --------------------------------------------------------------------

insert into public.prices (key, label, amount_ghs, time_text, is_public, never_public, shown_on)
values
  ('passport_standard', 'Passport, standard', 600, 'About 1 month', true, false, '{home,passports}'),
  ('passport_express', 'Passport, express', 1800, '[PLACEHOLDER: express timeline, waiting on ELC]', true, false, '{home,passports}'),
  ('consultation_30', 'Consultation with the CEO, 30 minutes', 100, '30 minutes', true, false, '{home}'),
  ('consultation_60', 'Consultation with the CEO, 1 hour', 200, '1 hour', true, false, '{home}'),
  ('birth_certificate', 'Birth certificate', null, '[PLACEHOLDER: birth certificate price, waiting on ELC]', false, false, '{passports}'),
  ('school_application', 'School application', null, null, false, true, '{}'),
  ('visa_processing', 'Visa processing', null, null, false, true, '{}');

-- LIVE schedule -------------------------------------------------------------
-- Host rotation per weekday has not been confirmed, so host_id stays null.

insert into public.live_schedule (weekday, topic, host_id, starts_at_time, ends_at_time)
select weekday, null, null, '12:00', '14:00'
from generate_series(1, 5) as weekday;

-- Sample content, from the mockups ------------------------------------------

insert into public.scholarships (
  slug, name, where_text, levels, covers, official_url, opens_on, deadline_on,
  deadline_text, verified_on, verified_by, not_pay_to_apply, publish_state, owner_id
)
values
  ('sample-erasmus-mundus', '[Sample] Erasmus Mundus Joint Master’s', 'Europe (2+ countries)', '{Master’s}',
    'Full award, including about €1,400 a month', 'https://example.test/sample/erasmus-mundus', null, null,
    'Set per programme; many Oct–Jan', '2026-10-26', '00000000-0000-4000-8000-000000000005', true, 'published',
    '00000000-0000-4000-8000-000000000005'),
  ('sample-stipendium-hungaricum', '[Sample] Stipendium Hungaricum', 'Hungary', '{Bachelor’s,Master’s,PhD}',
    'Tuition, monthly stipend, housing support', 'https://example.test/sample/stipendium-hungaricum', current_date + 30, null,
    'Expected mid-January (to be confirmed)', '2026-10-26', '00000000-0000-4000-8000-000000000005', true, 'published',
    '00000000-0000-4000-8000-000000000005'),
  ('sample-chevening', '[Sample] Chevening Scholarships 2027/28', 'United Kingdom', '{Master’s}',
    'Full award', 'https://example.test/sample/chevening', null, '2026-10-06',
    'Closed 6 Oct 2026', '2026-10-26', '00000000-0000-4000-8000-000000000005', true, 'published',
    '00000000-0000-4000-8000-000000000005');

insert into public.posts (slug, title, summary, body, category, author_id, owner_id, publish_state, published_at, reviewed_by)
values
  ('sample-standard-or-express-passport', '[Sample] Standard or express passport: which one do you need?',
    'Prices, timelines and when paying for speed actually makes sense.', '{"type": "doc", "content": []}', 'passports',
    '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', 'published', now(), '00000000-0000-4000-8000-000000000002'),
  ('sample-ielts-or-toefl', '[Sample] IELTS or TOEFL? How to choose, and three mistakes to avoid',
    'Which test your schools accept and how to prepare in six weeks.', '{"type": "doc", "content": []}', 'exams',
    '00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', 'published', now(), '00000000-0000-4000-8000-000000000002');

update public.posts
set body_html = '<p>[Sample] Standard takes about a month and express is faster.</p><h2>Which one do you need?</h2><p>Choose by your travel date, not by habit.</p><ul><li>Check your date</li><li>Check your documents</li></ul>'
where slug = 'sample-standard-or-express-passport';

update public.posts
set body = '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "[Sample] Which test your schools accept comes first."}]}, {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Three mistakes to avoid"}]}, {"type": "paragraph", "content": [{"type": "text", "text": "Booking too late is the commonest.", "marks": [{"type": "bold"}]}]}]}'
where slug = 'sample-ielts-or-toefl';

insert into public.posts (slug, title, summary, body_html, category, author_id, owner_id, publish_state, published_at, reviewed_by)
select
  'sample-exam-tip-' || n, '[Sample] Exam tip ' || n, 'A short sample tip.', '<p>[Sample] Tip ' || n || '.</p>', 'exams',
  '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', 'published', now() - (n || ' days')::interval,
  '00000000-0000-4000-8000-000000000002'
from generate_series(1, 11) as n;

-- Proves the sanitiser: every hostile part of this body must be gone from the page.
insert into public.posts (slug, title, summary, body_html, category, author_id, owner_id, publish_state, published_at, reviewed_by)
values
  ('sample-sanitiser-check', '[Sample] Sanitiser check', 'A post with hostile HTML in its body.',
    '<p onclick="window.hacked=1">Safe paragraph.</p><script>window.hacked=1</script><img src=x onerror="window.hacked=1"><iframe src="https://example.test/frame"></iframe><a href="javascript:window.hacked=1">Bad link</a><a href="https://example.test/good" style="color:red">Good link</a>',
    'travel', '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'published', now() - interval '30 days', '00000000-0000-4000-8000-000000000002');

insert into public.posts (slug, title, summary, body_html, category, author_id, owner_id, publish_state)
values
  ('sample-draft-post', '[Sample] Draft post', 'Must never be visible.', '<p>Draft.</p>', 'exams',
    '00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', 'draft');

with added as (
  insert into public.videos (platform, url, title, keyword, publish_state, added_by, owner_id, published_at)
  values
    ('tiktok', 'https://www.tiktok.com/@_ernestlinksconsult', '[Sample] Getting your passport in Kumasi: what it costs', 'PASSPORT', 'published',
      '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', now()),
    ('instagram', 'https://www.instagram.com/_ernestlinksconsult/', '[Sample] Malta nursing bridging: 6 months, explained', 'MALTA NURSING', 'published',
      '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', now()),
    ('youtube', 'https://www.youtube.com/watch?v=sampleVideo1', '[Sample] Choosing a programme that fits your budget', 'STUDY', 'published',
      '00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', now())
  returning id
)
insert into public.video_placements (video_id, page_key)
select added.id, page.key
from added
cross join (values ('videos'), ('home'), ('school'), ('visa')) as page (key);

update public.videos set pinned = true where url like '%sampleVideo1';

update public.videos set pinned = true where url like '%sampleVideo1';

insert into public.programmes (
  kind, country, city, level, title, duration_text, tuition_text, keyword,
  correct_as_of, internal_school_name, publish_state, owner_id
)
values
  ('study', 'Malta', null, 'BSc', '[Sample] Health & Social Care', null, 'Tuition €6,000 first year', 'MALTA CARE',
    '2026-10-31', '[Sample] internal school name, never rendered', 'published', '00000000-0000-4000-8000-000000000005'),
  ('study', 'Malta', 'St Julian’s', 'MBA', '[Sample] MBA, St Julian’s', '12 months', 'Tuition €10,000', 'MALTA MBA',
    '2026-10-31', '[Sample] internal school name, never rendered', 'published', '00000000-0000-4000-8000-000000000005'),
  ('bridging', 'Malta', null, 'Bridging', '[Sample] Nursing bridging programme', '6 months', 'Tuition €5,000, paid to the school', 'MALTA NURSING',
    '2026-10-31', '[Sample] internal school name, never rendered', 'published', '00000000-0000-4000-8000-000000000004');

insert into public.openings (country, sector, title, requirements, candidate_costs, keyword, correct_as_of, publish_state, owner_id)
values
  ('UAE', 'Hospitality', '[Sample] Hospitality roles in Dubai', '[PLACEHOLDER: roles and requirements, waiting on ELC]',
    '[PLACEHOLDER: what the candidate pays, waiting on ELC]', 'DUBAI', '2026-10-31', 'published', '00000000-0000-4000-8000-000000000006');

insert into public.drives (host_name, publish_state, owner_id)
values
  ('[Sample] KNUST College of Engineering', 'published', '00000000-0000-4000-8000-000000000006'),
  ('[Sample] KNUST College of Science', 'published', '00000000-0000-4000-8000-000000000006');

insert into public.trips (title, destination, publish_state, owner_id)
values
  ('[Sample] [Trip name]', '[Destination]', 'published', '00000000-0000-4000-8000-000000000002');

insert into public.faqs (service_key, question, answer, sort_order, publish_state, owner_id)
values
  (null, '[Sample] Is the consultation free?', 'Yes, on our TikTok LIVE on weekdays, 12–2pm, where a different ELC host answers questions. For a private plan on your case, book a one-on-one with our CEO: GH¢100 for 30 minutes or GH¢200 for an hour.',
    1, 'published', '00000000-0000-4000-8000-000000000004'),
  (null, '[Sample] Where are your offices?', 'Ayeduase, KNUST Engineering Gate office and Kotei Astro Turf office, next to Unik Pub, both in Kumasi. We are open Monday to Friday, 8:00–17:00.',
    2, 'published', '00000000-0000-4000-8000-000000000004'),
  ('passport', '[Sample] How long does a passport take?', 'Standard takes about 1 month. Final dates depend on the Passport Office, and we tell you straight away if anything changes.',
    1, 'published', '00000000-0000-4000-8000-000000000004'),
  ('visa', '[Sample] Can you guarantee my visa?', 'No. The embassy decides. We make sure your application is complete, accurate and on time.',
    1, 'published', '00000000-0000-4000-8000-000000000005'),
  ('exams', '[Sample] Which test do I need?', 'It depends on your schools. Some waive the English test, so check with us before you pay for one.',
    1, 'published', '00000000-0000-4000-8000-000000000004'),
  ('birth', '[Sample] How do I start a birth certificate?', 'Start online and we tell you what we need from you. Times depend on the registry.',
    1, 'published', '00000000-0000-4000-8000-000000000004'),
  ('school', '[Sample] Can you choose a school for me?', 'We shortlist programmes that fit your goals and budget, and you decide.',
    1, 'published', '00000000-0000-4000-8000-000000000004'),
  ('work', '[Sample] Do you find jobs abroad?', 'We guide you through the options and paperwork. Employers make the hiring decision.',
    1, 'published', '00000000-0000-4000-8000-000000000004'),
  ('travel', '[Sample] Do you plan group trips?', 'Yes. Published trips are listed on our travel page, and you can ask about others.',
    1, 'published', '00000000-0000-4000-8000-000000000004'),
  (null, '[Sample] Do you guarantee admissions, visas or jobs?', 'No. Schools, embassies and employers make those decisions. We make sure your application is complete, accurate and on time, and we tell you honestly where you stand.',
    3, 'published', '00000000-0000-4000-8000-000000000004');

-- The mockup's own placeholder, not a real client's words.
insert into public.testimonials (display_name, service_key, year, quote, permission_on_file, publish_state, owner_id)
values
  ('[Sample] [First name, initial]', 'passport', 2026, '[Sample] [Client''s own words about their passport, used with written permission.]', true, 'published', '00000000-0000-4000-8000-000000000002');
