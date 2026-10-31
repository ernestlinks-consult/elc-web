# Design Spec

Build every screen from two sources: the [ErnestLinks Consult Design System](https://claude.ai/artifact/YCuh2kDc3RYkR3SeXdzLg5) for tokens, components and brand rules, and the [Website Redesign canvas](https://claude.ai/artifact/4KgPH8WmTuLGxzgduWZhdL) for each page's layout and copy. Where they disagree, the design system wins on values and the canvas wins on layout.

(In this handoff pack: the design system is in `design-system/`, the canvas sources are in `mockups/`.)

## Design principles

1. **One clear next step.** Every section ends in Start online, WhatsApp or the booking link; Start online is the primary button.
2. **Honest and specific.** Real prices where allowed, real dates, "correct as of" on programmes, no guarantees.
3. **Light on data.** Under 1.5 MB per page; images in WebP; video embeds load on tap.
4. **Readable by everyone.** WCAG 2.2 AA, 17px body text, 44px touch targets, visible focus.
5. **The logo is the palette.** Logo blue, the red star as a small accent, black ink, lots of white.

## Core tokens

The full set (21 colours, 11 text styles, 8 spacing steps, 5 radii, 4 shadows) lives in the design system's `tokens.json`; these are the ones every screen uses.

| Token | Value | Use |
| --- | --- | --- |
| blue | #0505C6 | Primary buttons, links, blue sections |
| blue-deep | #04048F | Footer, portal sidebar, hover |
| blue-tint | #F5F6FF | Alternate sections, quiet cards |
| ink / ink-muted | #0B0B1F / #4A4A68 | Text / secondary text |
| red / red-text | #EA0606 / #C70404 | Star and red fills / red words |
| line / line-strong | #DADDF5 / #8A8FC7 | Decorative borders / control borders |
| Font | DM Sans 400–900 | All text (Conthrax only inside the logo files) |
| Radii | 10, 14, 22, 30, pill | Inputs, steps, cards, panels, buttons |

## Page templates

| Template | Pages | Sections, top to bottom |
| --- | --- | --- |
| Home | / | Header · hero (H1, lead, Start online + WhatsApp, trust line, LIVE note, photo with floating price card) · six service cards · LIVE vs CEO consultation · passport packages · track record (drives, testimonials) · resources teaser · about + team · contact form · footer · phone bar |
| Service | six service pages | Header · blue hero (breadcrumb, H1, lead, Start online + secondary, trust line) · 2–5 content sections (packages, steps, lists, checklists, cards) · promise panel · cross-links · footer |
| Form | /start, /start/done | Header · title and service tabs · form card (stepper, saved banner, fields, Back / Finish later / Continue) + side panel (no-pressure promises, what we collect later, prefer to talk) · footer |
| Hub | /resources | Header · title with pattern texture · four section cards · "New this week" three columns · footer |
| List | blog, scholarships, videos, FAQs | Header · title · filter chips · card grid or accordion · pagination or empty state · footer |
| Article | blog post | Header · breadcrumb, category, H1, summary, author line · cover · share rail + 720px text column with inline Start online box · author box · related posts · footer |
| Content | about, contact, legal | Header · title · alternating sections · footer |
| Portal | /portal/* | blue-deep sidebar (248px) · work area on blue-tint · page title row · white panels (tables, editors, side panels) |

## Component inventory for the Next.js app

| Folder | Components | Status |
| --- | --- | --- |
| components/ui | Button, Badge, Field (input, textarea), Select, Chip, ChipGroup (fieldset), Card, Stepper, Tabs, Accordion, Dialog, Toast, Table, Pagination, EmptyState, Skeleton | Button, Badge, Field, Chip, Card, Stepper defined in the design system; the rest follow its tokens (Radix primitives restyled) |
| components/site | Header (with Services and Resources menus, mobile menu), TopBar, Footer, PhoneBar, Breadcrumbs, ServiceHero, TrustLine, StepsList, PriceTable, ProgrammeCard, ScholarshipCard, VideoEmbed (click-to-load facade), BlogCard, TeamGrid, OfficeCard, ReadinessChecklist, PatternBackground | From the canvas |
| components/forms | StartOnlineForm, ServiceTabs, StepRenderer, SavedBanner, LaterPanel, ThankYou, ContactForm, AlertsSignup | From the canvas Start online page |
| components/portal | Sidebar, PageHeader, KpiCard, BarList, Funnel, LeadsTable, LeadPanel, Timeline, StatusSelect, ContentTable, ContentEditor, RichTextEditor (Tiptap), ImageUpload, PublishBar (draft, review, publish), VerifyChecklist, VideoLinkInput, SettingsForm, RoleTable, AuditTable | From the portal screens |

## States every screen needs

| State | Rule |
| --- | --- |
| Loading | Skeleton blocks in blue-tint-strong matching the layout; no spinners on public pages |
| Empty | One sentence and one action ("No open scholarships right now. Get alerts on WhatsApp.") |
| Error | Plain words, what to do next, and WhatsApp as a fallback on public pages |
| Form errors | Inline under the field, red-text, announced; summary at the top for submits with several errors |
| Saved | success-tint banner ("Saved. We have your details and will message you, even if you stop here.") |
| Offline or slow | Forms keep typed values; a failed save shows "Couldn't save. Check your connection and try again." |

## Responsive rules

- Layouts are fluid; cards use `repeat(auto-fit, minmax(…, 1fr))`. The one hard breakpoint is 820px: header collapses to a menu button and the phone bar appears.
- Hero and section headings scale with `clamp()` (display 40–72px, H2 30–46px).
- Tables scroll horizontally inside their panel on phones; the leads inbox switches to a card list under 820px.

## Images

| Use | Size (px) | Format |
| --- | --- | --- |
| Hero photo | 1600 × 1200 | WebP/AVIF via next/image, priority load |
| Card and drive photos | 800 × 500 | WebP, lazy |
| Team portraits | 800 × 1000 (4:5) | WebP, lazy |
| Blog cover | 1600 × 700 | WebP |
| Social share (Open Graph) | 1200 × 630 | PNG or JPG, one per page type |
| Favicon set | 32, 180, 192, 512 | PNG from elc-mark.svg |

Every uploaded image needs alt text; decorative images get empty alt. Photos of clients need written permission on file.

## Build order for Claude Code

1. Scaffold Next.js (App Router, TypeScript, Tailwind), Supabase CLI, ESLint, Vitest, Playwright.
2. Generate `styles/tokens.css` and the Tailwind theme from the design system's `tokens.json`; load DM Sans with next/font.
3. Build `components/ui` from the design system, then Header, Footer and PhoneBar.
4. Write the Supabase migrations from the Data Model tab (tables, enums, views, RLS, triggers) and the seed data.
5. Build the Start online forms and the leads inbox first (Phase 1 core), with SMS and email through the outbox.
6. Build the public pages template by template, reading content from Supabase.
7. Add SEO (metadata, sitemap, robots, structured data), redirects, analytics events.
8. Phase 2 content editors and settings; Phase 3 dashboard and automations.

Give Claude Code this document's link and the design system's link at the start of each session, and ask it to work one numbered step at a time.
