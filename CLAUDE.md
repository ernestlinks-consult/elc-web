# CLAUDE.md — ErnestLinks Consult website & staff portal (elc-web)

Copy this file to the root of the `elc-web` repository. Claude Code reads it at the start of every session.

## What we are building

The new ernestlinksconsult.com (public site + "Start online" lead forms) and the ELC staff portal at `/portal`, in one Next.js app backed by Supabase. ELC (ErnestLinks Consult, Kumasi, Ghana) helps students and young professionals with passports and birth certificates, school applications, visas, work abroad, proficiency exams, and travel.

The full specification is in `docs/` (copy the handoff pack's `docs/` folder into the repo):

| File | Read it for |
| --- | --- |
| `docs/01-PRD.md` | Goals, roles, phases, every requirement with an ID (W-, F-, P-) and acceptance criteria |
| `docs/02-Information-Architecture.md` | Every page, URL, template, navigation, redirects |
| `docs/03-System-Architecture.md` | Stack, repo structure, environments, caching, security model |
| `docs/04-Data-Model-ERDs.md` | 25 tables, enums, RLS rules, key SQL, form definition types |
| `docs/05-Design-Spec.md` | Tokens, templates, component inventory, states, build order |
| `design-system/` | `tokens.json`, component READMEs and previews (Button, Badge, Field, Chip, Card, Stepper) |
| `mockups/canvas/*.dc.html` | Layout and copy for each page and portal screen |

Live versions: PRD https://claude.ai/artifact/SGZQ2ovDAcxgM9LJeHPB9B · Design system https://claude.ai/artifact/YCuh2kDc3RYkR3SeXdzLg5 · Mockups https://claude.ai/artifact/4KgPH8WmTuLGxzgduWZhdL

## Stack

Next.js (App Router) + TypeScript + React Server Components · Tailwind CSS on ELC tokens · shadcn/ui (Radix) restyled · React Hook Form + Zod · Supabase (Postgres + RLS, Auth with TOTP for admins, Storage, pg_cron, Edge Functions) · Tiptap · iSmart SMS · Resend · Sentry · Vitest, Playwright, axe-core · Vercel (paid plan).

Accounts: ELC owns the GitHub organisation, the Vercel team and the Supabase projects (staging + production). Never commit secrets; use Vercel/Supabase env settings.

## How to work

- Follow the build order in `docs/05-Design-Spec.md`, one numbered step per session. Start each step by restating which requirement IDs it covers.
- Phase 1 first: Start online forms + leads inbox + SMS/email outbox + staff sign-in and roles + public pages + redirects. Phases 2 and 3 come after.
- Database changes only as SQL migrations in `supabase/migrations/`. Every table has RLS enabled; write the policy in the same migration.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in server code (`lib/supabase/admin.ts`) and Edge Functions. Never import it into a client component.
- Validate every form step with the same Zod schema on client and server. Forms live in `lib/forms/{service}.ts`; bump `version` when fields change.
- Public pages are static with cache tags; publishing in the portal calls `revalidateTag`.
- Run `npm run lint`, `npm test` and the Playwright suite before calling a step done. Add an axe check for every new page.

## Local setup

- Docker Desktop must be running. It is installed on drive D here, not C.
- `npm run db:start` starts local Supabase. Its API is on port 44321, not 54321, because Windows reserves the 543xx range on this machine. `npm run db:reset` rebuilds it from migrations and the seed.
- `.env.local` holds only local values: the Supabase URL and anon key, plus the local service-role key, `LEAD_SESSION_SECRET` and `NOTIFY_CRON_SECRET`. Real keys live in Vercel and Supabase settings.
- Notifications run through the outbox. Locally nothing sends on a schedule: run `npm run notify:run`. SMS appears in `docker logs supabase_edge_runtime_elc-web`, email in the mail viewer at http://127.0.0.1:44324. Only the worker in `lib/notify` may call a provider.
- `supabase/seed.sql` is for local and staging only. It creates sign-ins with a shared password and must never run on production.
- `npm run build`, `npm run test:e2e` and `npm run test:integration` need the database running. Run the integration suite on its own: its worker takes every due row.

## Design rules (from the design system)

- Colours: blue #0505C6 (primary), blue-deep #04048F (footer, portal sidebar), blue-tint #F5F6FF, ink #0B0B1F, ink-muted #4A4A68, red #EA0606 for the star and red fills with white text only, **red-text #C70404 for any red words**. Control borders #8A8FC7 on white, #6E6EF0 on navy. Never put red text or icons on blue.
- Font: DM Sans only (next/font, self-hosted). Conthrax appears only inside the logo SVGs. No icon fonts.
- Focus ring: `0 0 0 3px #FFFFFF, 0 0 0 6px #0505C6` on every interactive element.
- Body text 17px, touch targets ≥ 44px, one hard breakpoint at 820px (menu button + sticky phone bar below it).
- Start online is the primary button everywhere; WhatsApp is secondary.
- `starter/tokens.css` in the handoff pack is generated from `tokens.json`; use it as `styles/tokens.css` and map it into the Tailwind theme.

## Content and privacy rules (must be enforced in code)

1. Never collect Ghana Card, SSNIT or Voter ID numbers, document uploads, payment details or facilitator fields on the website.
2. A lead is created when step 1 is saved (name, WhatsApp, two service choices, best time, consent). Later steps add to the same lead. Duplicate = same phone + service within 7 days.
3. No guarantees of admission, visas or jobs. No school names in public listings (`programmes.internal_school_name` is never rendered).
4. Prices flagged `never_public` (school applications, visa processing) are never rendered anywhere.
5. Scholarships publish only with an official URL and two verification ticks; status is computed from dates in Africa/Accra time.
6. Testimonials publish only when `permission_on_file` is true.
7. Video embeds load only when tapped (click-to-load facade); keep the homepage under 1.5 MB.

## Known facts to seed

- Team (about page + staff table): Ernest A. — Chief Executive Officer (admin); Godfred A. — Managing Director, Growth and Strategy (admin); Priscilla A. — Administrative Assistant (front desk); Grace Y. — Programs and Documentation Officer (editor); Peace A. — Study Abroad Counsellor (editor); Nathaniel A. — Outreach Lead (editor).
- Passport: standard GH¢600 (about 1 month), express GH¢1,800. Paid consultation with the CEO: GH¢100 / 30 min, GH¢200 / 1 hr. Free help: TikTok LIVE every weekday afternoon, a different host each day.
- Booking page is external: https://ernest-links-frontend.vercel.app/book (store the URL in `settings`).
- Open questions still waiting on ELC are listed at the end of `docs/01-PRD.md`. Use clearly marked placeholders for them; never invent prices, dates or testimonials.
