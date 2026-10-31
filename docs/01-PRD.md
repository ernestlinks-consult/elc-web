# ErnestLinks Consult Website & Staff Portal: PRD and Technical Specification

Oct 31, 2026 · @Goddy

This document specifies the new ernestlinksconsult.com and the ELC staff portal, to be built with Next.js and Supabase. Tabs: PRD (this tab), Information Architecture, System Architecture, Data Model, Design Spec.

## 1. Overview

ELC will replace its WordPress-theme website with a fast Next.js site and a staff portal on Supabase, so that interested visitors become leads the team can follow up, and the team can keep content current without a developer.

**Problem.** The current site (audited 31 Oct 2026) loses enquiries and trust:

- The contact form posts to the theme vendor's server, so messages never reach ELC.
- Half the menu leads to theme demo pages or 404s; the homepage weighs about 28 MB and takes about 15 s to load.
- The only calls to action are WhatsApp and phone. Visitors who are interested but hesitant leave without making contact.
- There is no way for staff to publish scholarships, videos, blog posts or price changes without editing code.

**Goals.**

1. Capture every interested visitor as a lead, with a low-pressure online first step.
2. Give staff one portal to manage leads and all changing website content.
3. Present ELC accurately and credibly, following its house rules (no guarantees, no school names, no public study abroad or visa prices).
4. Load fast on mobile data in Ghana and meet WCAG 2.2 AA.

**Success metrics** (baselines are measured from launch, because the current site has no analytics).

| Metric | Target 90 days after launch |
| --- | --- |
| Leads per month from the website | Baseline set in month 1, then +25% |
| Form starts that save step 1 | 40% or more |
| Median time to first reply (working hours) | Under 2 hours |
| Leads that become paying clients | Tracked monthly; target set after month 1 |
| Homepage weight on mobile | Under 1.5 MB |
| Largest Contentful Paint, 75th percentile mobile | Under 2.5 s |
| Pages published without a developer | 100% of blog, scholarship, video and price updates |

**Source material.** Website mockups and portal screens: [ErnestLinks Consult Website Redesign canvas](https://claude.ai/artifact/4KgPH8WmTuLGxzgduWZhdL). Audit: [Website Audit (Oct 2026)](https://claude.ai/artifact/HXvYFX7mD2EM8SB5CnWCXZ). Visual system: [ErnestLinks Consult Design System](https://claude.ai/artifact/YCuh2kDc3RYkR3SeXdzLg5).

## 2. Users and roles

The site serves five kinds of visitor; the portal serves six staff in three roles.

**Visitors**

| Persona | Typical need | What success looks like |
| --- | --- | --- |
| KNUST student or recent graduate | Passport, IELTS, school application, scholarships | Saves step 1 of a form, or joins the LIVE |
| Young professional (nurse, hospitality worker) | Work abroad, bridging programme, visa | Starts a Work abroad form; checks an offer for scams |
| Parent or guardian | Birth certificate, passport for a child, paying for a child's studies | Clear prices and steps; a named person to talk to |
| Association or department leader | Passport drive for members | Sends a DRIVE request |
| Traveller | Flights, hotels, tourist visa, conference trip | Requests a quote |

Most visitors arrive on a phone, often from TikTok or Instagram, on mobile data.

**Staff roles in the portal**

| Role | People (Oct 2026) | Can do |
| --- | --- | --- |
| Admin | Ernest A. (CEO), Godfred A. (MD, Growth and Strategy) | Everything, including settings, prices, team and roles, publishing any content |
| Editor | Grace Y., Peace A., Nathaniel A. | Manage their assigned content types and the leads assigned to them; send content for review |
| Front desk | Priscilla A. | See and assign all new leads; update lead status; no content editing |

Proposed default assignments: Peace (school applications, visas; scholarships, blog, programmes), Grace (passports, birth certificates, exams; FAQs, programmes), Nathaniel (passport drives, work abroad; drives, work openings), Priscilla (travel; assigns new leads). Admins can change these in Settings.

## 3. Scope and phases

The build ships in three phases; Phase 1 alone fixes lost enquiries and replaces the current site.

**In scope**

- Public website: all pages in the Information Architecture tab, built from the canvas mockups.
- Start online forms for seven services, saving each lead from step 1.
- Staff portal: leads, content management for every dynamic content type, settings, team and roles, dashboard.
- Automatic SMS acknowledgement of new leads; staff email alerts.
- Analytics, SEO basics and redirects from old URLs.

**Out of scope (for now)**

- The booking page at ernest-links-frontend.vercel.app/book. It was built by an outside developer; the site links to it. Integration is a later project.
- Online payments. Clients pay at the office or to the official MoMo; the site only states this.
- Client accounts or document uploads by clients. Ghana Card numbers and document copies are collected in person or through a secure channel, never on the website.
- Two-way WhatsApp messaging inside the portal (WhatsApp links only in Phase 1).
- Languages other than English.

**Phases**

| Phase | Delivers | Done when |
| --- | --- | --- |
| 1. Launch | Public site (all pages, static content seeded from the mockups); Start online forms; leads inbox with assignment, status, notes; SMS acknowledgement; staff sign-in and roles; analytics; redirects; domain switched | Old site retired; a test lead from every form reaches the inbox and the SMS arrives |
| 2. Content | Portal editors for scholarships, blog, videos, programmes and openings, passport drives, group trips, FAQs, team; settings for prices, contact details, hours and LIVE schedule; review workflow | Staff publish a scholarship, a video and a price change without a developer |
| 3. Insight and automation | Dashboard metrics and funnel; auto-close of past-deadline scholarships; 60-day review flags; weekly digest email; CSV export | Dashboard numbers match the leads table for a sample week |

## 4. Requirements: public website

Every page shares one header and footer, reads its changing content from the database, and ends in a Start online, WhatsApp or booking action. P1 = Phase 1, P2 = Phase 2.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| W-01 | Shared header with Services and Blog & Resources menus, About, Contact, WhatsApp and Start online buttons, and a top bar with phones, hours and the LIVE note | Menus open by click and keyboard; current section is highlighted; collapses to a menu button under 820 px | P1 |
| W-02 | Comprehensive shared footer (CTA bar, services, resources, company, offices, socials, Scholarship Hunt alerts sign-up, legal links, no-guarantee line) | All links resolve; contact data comes from Settings | P1 |
| W-03 | Sticky phone bar: Start online, WhatsApp, Call | Shown under 820 px only; never covers form buttons | P1 |
| W-04 | Home page as in the mockup: hero, six services, LIVE vs CEO consultation, passport packages, track record, resources teaser, about and team, contact form | Prices, LIVE schedule and team come from the database | P1 |
| W-05 | Service pages: Passports & Birth Certificates, School Applications, Visa Applications, Work Abroad, Proficiency Exams, Travel & Tours | Each has a Start online primary CTA and a WhatsApp keyword; no school names; no study abroad or visa prices | P1 |
| W-06 | Programmes open now (School Applications) and Open now (Work Abroad) lists | Rendered from Programme and Opening records; each shows "correct as of" date; hidden when unpublished | P1 static, P2 managed |
| W-07 | Visa readiness checklist | Six items; live count; CTA to Start online | P1 |
| W-08 | Blog & Resources hub, Blog list with topic filter and pagination, article page | Article has author, date, read time, share links, inline Start online box, related posts | P1 static, P2 managed |
| W-09 | Scholarship Hunt page with status filter (Open, Opening soon, Closed) | Status computed from dates; each card shows verified date and official link | P2 |
| W-10 | Videos page with platform filter, using official embeds | Video plays in the platform's player on the page; fallback link if the embed fails | P2 |
| W-11 | FAQs page grouped by service, searchable | Answers expand and collapse; search filters questions | P1 static, P2 managed |
| W-12 | About page (story, purpose, vision, mission, values, team of six) and Contact page (four channels, two offices with maps, general message form) | Team and contact data come from the database | P1 |
| W-13 | General contact form and footer alert sign-up | Submissions are stored as Messages and Subscribers, never emailed to a third party | P1 |
| W-14 | Redirects from old URLs (/about-us/, /services/, /contact/, /faqs/, /blog/ and the demo paths) | 301 to the closest new page; demo paths to the hub or home | P1 |
| W-15 | Privacy notice, terms, payments and refunds pages | Linked from footer and every form; text supplied by ELC | P1 |

## 5. Requirements: Start online forms and lead capture

A visitor becomes a lead the moment step 1 is saved; every later step only adds detail to that same lead.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| F-01 | One Start online page with a tab per service: Passport, Birth certificate, School applications, Visa, Work abroad, Exams, Travel | Service pages deep-link to their tab (`/start?service=passport`) | P1 |
| F-02 | Step 1 for every service: full name, WhatsApp number, two service choices, best time to reach, consent tickbox | Saving creates a Lead with status New and a reference such as ELC-PP-1042 | P1 |
| F-03 | Later steps per service, as specified in the Data Model tab (form definitions) | Each step saves on Continue; leaving the page keeps what was saved | P1 |
| F-04 | "Finish later, just contact me" on every step after step 1 | Marks the lead as partial and shows the thank-you screen | P1 |
| F-05 | Thank-you screen with owner name, reply-time promise, reference and next steps | Owner and promise come from Settings and service assignment | P1 |
| F-06 | Never collect Ghana Card, SSNIT or Voter ID numbers, document copies or payment details on the website | Fields absent; a side panel lists what will be collected later | P1 |
| F-07 | Validation: required fields, Ghana phone format (0XX XXX XXXX or +233), email format, dates in the past for birth dates | Errors shown inline, announced to screen readers, focus moves to the first error | P1 |
| F-08 | Spam protection without puzzles: hidden honeypot field, rate limit per IP and phone, Cloudflare Turnstile only if abuse appears | Bots blocked; real users never see a CAPTCHA by default | P1 |
| F-09 | Attribution: page the form was started from, referrer, UTM tags, and "How did you hear about us?" | Stored on the lead; reported on the dashboard | P1 |
| F-10 | Assignment: new leads go to the service owner from Settings; unassigned if none | Owner sees the lead in Mine; front desk sees all | P1 |
| F-11 | Acknowledgement: SMS to the lead within 1 minute, naming the owner and reference; email alert to the owner | Sent once per lead; failures logged and retried | P1 |
| F-12 | Duplicate check: same phone and service within 7 days attaches to the existing lead | No duplicate leads for refresh or double submit | P1 |

## 6. Requirements: staff portal

The portal lives at /portal on the same app, behind staff sign-in; what each person sees is enforced by database rules, not just hidden in the interface.

| ID | Requirement | Acceptance criteria | Phase |
| --- | --- | --- | --- |
| P-01 | Sign-in with email magic link or password; two-step sign-in required for admins; invite-only accounts | No public sign-up; disabled staff lose access immediately | P1 |
| P-02 | Roles: Admin, Editor, Front desk, with per-content-type permissions | Database row-level security matches the role table in section 2 | P1 |
| P-03 | Leads inbox: list with status tabs, service and owner filters, search; detail panel with answers, timeline, notes, WhatsApp and call links | Status changes and notes write a timeline event with who and when | P1 |
| P-04 | Lead statuses New → Contacted → Started → Paid → Closed, with a reason when Closed | First change from New records first-reply time | P1 |
| P-05 | Overdue flag when a New lead waits more than the reply-time promise in working hours | Shown in red in the inbox and dashboard | P1 |
| P-06 | Messages (general contact form) and Subscribers (alerts) lists | Same inbox pattern; export to CSV | P1 |
| P-07 | Content editors: scholarships, blog posts, videos, programmes, work openings, passport drives, group trips, FAQs, team members | Each has list, create, edit, preview, publish/unpublish | P2 |
| P-08 | Review workflow: Draft → In review → Published for blog posts, openings and programmes; admins approve | Editors cannot publish these directly; comments kept on the item | P2 |
| P-09 | Scholarship rules: official link and two verification ticks required to publish; verified date set automatically; status computed from opens and deadline; closed the day after the deadline | Publish button disabled until checks pass | P2 |
| P-10 | Video rules: paste a TikTok, Instagram, Facebook or YouTube URL; platform detected; embed and thumbnail fetched; choose pages to show on; pin | Invalid URL shows a clear error | P2 |
| P-11 | Freshness: programmes and openings not re-checked in 60 days are flagged and, after 90 days, hidden | Flags appear on the dashboard | P3 |
| P-12 | Settings: prices with "shown on" list and public toggle; contact numbers; hours; reply-time promise; official MoMo; booking link; offices; LIVE schedule (topic and host per weekday); service owners | One change updates every page that uses it within 60 s | P2 |
| P-13 | Dashboard: new leads today, waiting for first reply, median first reply, leads to paid this month, leads by service, website funnel, needs-attention list | Figures computed from the database, not typed | P3 |
| P-14 | Audit log of every create, edit, publish, delete and settings change | Admins can view and filter by person and date | P2 |
| P-15 | Image uploads resized and converted to WebP on upload, maximum 2,000 px | No public image over 300 KB | P2 |

## 7. Non-functional requirements

The site must be fast on mid-range Android phones on mobile data, accessible to WCAG 2.2 AA, and careful with personal data.

| Area | Requirement |
| --- | --- |
| Speed | Homepage under 1.5 MB and 30 requests on first load; LCP under 2.5 s and INP under 200 ms at the 75th percentile on mobile; images in WebP/AVIF via next/image, lazy below the fold; fonts self-hosted with next/font (DM Sans only); no icon fonts; no third-party script on page load except analytics; video embeds load only when tapped (click-to-load facade) |
| Rendering | Public pages statically generated and revalidated on publish (on-demand ISR, fallback every 10 minutes); portal pages rendered on the server per request |
| Accessibility | WCAG 2.2 AA: contrast per the Design System, visible focus ring, keyboard access to menus and forms, labels on every field, errors announced, alt text required on uploaded images, touch targets at least 44 px, reduced-motion respected |
| Security | Supabase row-level security on every table; service-role key only on the server; input validated with Zod on the server; rate limits on public endpoints; security headers (CSP, HSTS, frame-ancestors none for the portal); admin two-step sign-in; dependencies updated monthly |
| Privacy | Collect only what each step needs; consent tickbox with link to the privacy notice; no ID numbers or documents on the website; leads older than 24 months without a sale are anonymised; staff can export or delete a person's data on request. ELC should confirm its obligations under Ghana's Data Protection Act, 2012 (Act 843), including registration with the Data Protection Commission |
| SEO | Unique title and description per page; absolute canonical URLs; sitemap.xml and robots.txt generated; Open Graph and X cards with a default ELC image; LocalBusiness structured data for both offices; Article data for blog posts; clean URLs; 301 redirects from the old site |
| Analytics | Privacy-friendly page analytics (Plausible or Vercel Web Analytics) plus first-party events stored in Supabase: form_open, step_saved, form_completed, whatsapp_click, call_click, booking_click, video_play |
| Reliability | Daily database backups (Supabase); error tracking (Sentry); uptime check on home and /start; staging environment mirrors production |
| Browsers | Last two versions of Chrome, Safari, Edge, Firefox; Android 10+ Chrome; iOS 16+ Safari; Opera Mini receives readable HTML without JavaScript-only features |

## 8. Integrations and content rules

Every outside service is optional to the page working: if one fails, the page still loads and the lead is still saved.

**Integrations**

| Service | Use | Notes |
| --- | --- | --- |
| Supabase | Database, staff auth, storage, row-level security, scheduled jobs (pg_cron), Edge Functions | Region chosen for latency to Ghana (EU West or Central); confirm at setup |
| Vercel | Hosting the Next.js app, previews per branch, cron, analytics | Free plan is for non-commercial use; use the paid plan |
| iSmart SMS (ELC's existing provider) | Lead acknowledgement SMS | Via a server-side function; sender ID "ELC" or similar to be registered |
| Email (Resend or similar) | Staff alerts, weekly digest, sign-in links | From a verified ernestlinksconsult.com address |
| TikTok, YouTube, Instagram, Facebook | Video embeds | TikTok and YouTube oEmbed are public; Instagram and Facebook oEmbed need a Meta app token |
| WhatsApp | wa.me links with prefilled keywords | WhatsApp Business Platform API is a later option |
| Google Maps | Office map links and static map images | No embedded map script on page load |
| Booking page | External link to ernest-links-frontend.vercel.app/book | URL stored in Settings; integration later |
| Sentry, Plausible | Errors, analytics | Optional on the free tiers to start |

**Content rules enforced by the product** (ELC house rules)

1. No guarantees of admission, visas or jobs. A fixed line in the footer; editors see a reminder on openings and programmes.
2. No school names in public listings; programmes are described by type and city ("a licensed business school in St Julian's").
3. No ELC prices for school applications or visa processing on the site. Settings marks these prices as never public.
4. One WhatsApp keyword per programme, opening and video, stored with the record.
5. Scholarships need an official link and two verification ticks; deadlines drive status automatically.
6. Client stories and photos need written permission; the testimonial record has a "permission on file" tick that must be set to publish.
7. Immigration statements carry "subject to current rules".

## 9. Release plan, risks and open questions

Launch Phase 1 on a staging URL first, test every form end to end, then switch the domain.

**Release checklist (Phase 1)**

- [ ] Accounts owned by ELC: GitHub organisation, Vercel team, Supabase project, domain DNS access
- [ ] Supabase staging and production projects; migrations applied; seed data loaded
- [ ] All seven forms tested on Android Chrome and iOS Safari; SMS received
- [ ] Staff accounts invited; roles checked by signing in as each role
- [ ] Privacy notice, terms, payments and refunds text supplied by ELC and published
- [ ] Redirects from old URLs tested
- [ ] Lighthouse mobile: Performance 90+, Accessibility 100
- [ ] DNS switched; old host kept for 30 days as rollback
- [ ] Google Search Console and Google Business Profile updated

**Risks**

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Leads arrive faster than staff reply | Hesitant visitors lose trust | Reply-time promise set realistically in Settings; overdue flags; front desk triage |
| Content goes stale (expired scholarships, old prices) | Credibility damage | Automatic closing, 60-day flags, single source for prices |
| Personal data exposure | Legal and reputational harm | No ID numbers or documents online; row-level security; admin two-step sign-in; data retention rule |
| Meta embed token issues | Instagram and Facebook videos fail to embed | Fallback card linking to the post |
| SMS provider downtime | No acknowledgement | Retry queue; email alert to the owner still sent |
| Single developer dependency | Stalls if the builder leaves | Code in ELC's GitHub; this document and the repo README kept current |

**Open questions for ELC**

- [ ] Express passport timeline; whether passport prices include the government fee; birth certificate price
- [ ] What to bring for passports (final list)
- [ ] Reply-time promise; owner per service; official MoMo name and number
- [ ] LIVE time and topic per weekday
- [ ] Exam registration and tuition fees and schedule; travel quote turnaround
- [ ] Dubai openings: roles, requirements, what candidates pay
- [ ] Payment methods and refund policy text; privacy notice text
- [ ] Team photos, office photos, drive dates and headcounts, testimonials with permission
- [ ] Resolved: ELC owns the GitHub, Vercel and Supabase accounts. Still to confirm: who controls DNS for ernestlinksconsult.com
