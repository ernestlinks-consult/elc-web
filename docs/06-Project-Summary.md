# ELC website audit & redesign (as of 31 Oct 2026)

- Full audit: "ErnestLinks Consult Website Audit (Oct 2026)" doc, https://claude.ai/artifact/HXvYFX7mD2EM8SB5CnWCXZ
- Redesign mockups (website + staff portal): "ErnestLinks Consult Website Redesign" canvas, https://claude.ai/artifact/4KgPH8WmTuLGxzgduWZhdL
- **PRD and technical specification** (tabs: PRD, Information Architecture, System Architecture, Data Model (ERDs), Design Spec): https://claude.ai/artifact/SGZQ2ovDAcxgM9LJeHPB9B
- **ErnestLinks Consult Design System** (tokens, brand book, logos, Button/Badge/Field/Chip/Card/Stepper): https://claude.ai/artifact/YCuh2kDc3RYkR3SeXdzLg5
- Build stack decided by Goddy: Next.js + Supabase, built with Claude Code. Give Claude Code the PRD and design system links each session; follow the Design Spec's "Build order for Claude Code".
- Accounts: ELC owns the GitHub, Vercel and Supabase accounts (confirmed 31 Oct 2026). Handoff zip "elc-website-handoff" bundles the specs, diagrams, design system, brand files and mockup sources.

## Verdict
Rebuild, don't patch. The current site is the "Gtbus" WordPress theme exported to static files; only Home, About, Services and Contact were rewritten.

## Critical issues on the live site
1. Contact form posts to themexriver.com (the theme vendor), so enquiries are lost.
2. Demo pages live and linked: /projects/, /project-masonry/ (Success Stories), /faqs/, /blog/ (Latin filler, "orange, USA", example@gmail.com, +880 phone).
3. 404s from the menu: /clients/, team profiles, blog posts, blog category.
4. Homepage ≈28 MB, 100 requests, ≈15 s load (two 10 MB PNGs: p1-img-1.png, p1-img-2.png).
5. No sitemap, robots.txt, OG tags, structured data or analytics; relative canonical; titles say "Gtbus"; copyright "Goddy Smart Labs".
6. Site never links to the booking page.

## Website brand (from D:\elc-vids\elc-logo-assets)
- Logo blue #0505C6 (primary), deep navy #04048F (footer, portal sidebar), text #0B0B1F, grey #4A4A68, tint #F5F6FF, white. Tagline "Making Impact Through Education and Travels".
- Red: #EA0606 for the star, badges and buttons with white text only; **text red #C70404** for any red words.
- Wordmark font Conthrax (logo only, used as outlined SVG); everything else DM Sans.
- The navy #002871 / yellow #F8CF3A palette belongs to the video kit, not the website.

## Accessibility (WCAG 2.2 check, 31 Oct 2026)
- Main pairs pass AAA: black/white 19.4:1, blue/white 11.4:1 both ways, grey/white 8.5:1, footer 11–14.8:1. White on #EA0606 is AA at 4.6:1.
- Fixes applied: text red #C70404; form borders #8A8FC7 on white and #6E6EF0 on navy; no fading on closed scholarships; no red text or icons on blue; visible keyboard focus ring on every page.

## Site structure (31 Oct 2026)
- Services: Passports & Birth Certificates, School Applications, Visa Applications (school = stage 1, visa = stage 2), Work Abroad, Proficiency Exams, Travel & Tours.
- Start online: step-by-step forms for Passport, Birth Certificate, School Applications, Visa, Work Abroad, Exams and Travel.
- Blog & Resources hub: Blog (list) + article template, Scholarship Hunt, Videos (official social embeds), FAQs.
- About (team of six) and Contact.
- One shared header and one comprehensive footer.

## Team shown on the site (31 Oct 2026)
Ernest A. (Chief Executive Officer), Godfred A. (Managing Director, Growth and Strategy), Priscilla A. (Administrative Assistant), Grace Y. (Programs and Documentation Officer), Peace A. (Study Abroad Counsellor), Nathaniel A. (Outreach Lead).

## Booking page (clarified 31 Oct 2026)
- ernest-links-frontend.vercel.app/book was built by an outside developer; ELC does not have full access. For now the website only links to it. Later ELC will ask that developer to fold it into ELC's own system.
- ELC has no staff system yet. The staff portal is designed and specified from scratch. No WordPress.

## Staff portal (designed 31 Oct 2026, on the canvas "Staff portal" page)
- Screens: Dashboard, Leads inbox, Scholarship Hunt manager, Videos, Blog editor, Settings & team (details in the PRD, section 6).
- Roles (proposed): Admin = Ernest, Godfred; Editor = Grace, Peace, Nathaniel; Front desk = Priscilla.
- Phases: 1 = website + Start online forms + leads inbox; 2 = content editors and settings; 3 = dashboard metrics and automations.

## Conversion approach (31 Oct 2026)
- Problem Goddy raised: visitors interested in a service rarely WhatsApp or call; they hesitate.
- "Start online" is the main button everywhere; WhatsApp is second; phones get a sticky Start online / WhatsApp / Call bar.
- Forms are progressive: step 1 is saved as a lead on its own; later steps optional; confirmation shows who will reply and a reference.
- Not collected on the website: Ghana Card, SSNIT, Voter ID numbers, document copies, payment details, facilitator fields.
- Consent tickbox and privacy notice; check Ghana Data Protection Act / Data Protection Commission registration.

## Decisions (Goddy, 31 Oct 2026)
- Free help = TikTok LIVE every weekday afternoon, a different host each day. Paid consultation (GH¢100 / 30 min, GH¢200 / 1 hr, Mon & Wed 10:30–14:30, MoMo) = one-on-one with the CEO.
- Passport: standard GH¢600 (about 1 month), express GH¢1,800.
- Exams: both registration and tuition.
- Mockups first, then code. No WordPress. Own staff portal. Next.js + Supabase.
- ELC owns the GitHub, Vercel and Supabase accounts.

## Still open
Express timeline; whether passport prices include the government fee; birth certificate price; documents-to-bring list; LIVE topic and time per weekday; drive dates/headcounts; testimonials with written permission; real partner logos; lead owners and reply-time promise; official MoMo name/number; payment methods and refund policy text; privacy notice text; exam fees and class schedule; Dubai openings details; travel quote turnaround; group trips; KNUST office landmark; team photos; real video links; who controls DNS for ernestlinksconsult.com.
