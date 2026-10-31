# ErnestLinks Consult — design system

ErnestLinks Consult (ELC) is a Kumasi consultancy for passports, proficiency exams, school and visa applications, work abroad and travel. Tagline: **Making Impact Through Education and Travels.** This system covers the public website and the staff portal. It was built from ELC's logo masters and the approved website redesign (31 Oct 2026).

## Voice and content

ELC sounds like a capable older sibling: clear, warm, honest, and never pushy.

- Lead with what the person gets and the next step: "Your passport, done right the first time." "Start online. No call needed."
- Short sentences, plain words, sentence case for headings and buttons. Verbs first on buttons: "Start online", "Book a slot", "Send message".
- Ghanaian context is normal, not exotic: GH¢ prices, MoMo, Ghana Card, KNUST, Kotei, Ayeduase.
- No exclamation marks in headings, no emoji, no hype ("guaranteed", "100%", "best in Ghana").

**House rules (always apply):**

1. Never promise admissions, visas or jobs. Use "We never guarantee…" and "subject to current rules" for immigration statements.
2. No school names in public content; describe the programme ("a licensed business school in St Julian's").
3. No ELC prices for school applications or visa processing in public. Passport and CEO-consultation prices may be shown.
4. One WhatsApp keyword per programme, video and campaign, in capitals: MALTA CARE, PASSPORT, SCHOLAR.
5. Real dates only; unknowns are written [CONFIRM] in drafts and never published.
6. Client names, quotes and photos only with written permission.

## Colour

The palette is the logo: **blue** (`blue`), the **red star** (`red`), black wordmark (`ink`) and white (`surface`).

- `blue` carries the brand: primary buttons, links, active states and full-bleed blue sections. On blue, text is `on-blue` and secondary text `on-blue-muted`.
- `blue-deep` is for the footer, the portal sidebar and pressed states. `blue-mid` sits inside blue sections for secondary blocks.
- `blue-tint` alternates with `surface` to separate page sections; `blue-tint-strong` fills image placeholders and progress tracks.
- **Red is an accent, never a text colour on its own.** `red` is for the star, the LIVE badge and a few red buttons with white text. Any red words (eyebrows, step numbers, keywords, deadlines) use `red-text`. Never put red on blue: they are too close in lightness (2.5:1).
- Status colours always pair with a word: Open (`success` on `success-tint`), Opening soon / In review (`warning` on `warning-tint`), Closed / Hidden (`ink-muted` on `neutral-tint`), New / overdue (`red-text` on `red-tint`).
- Borders: `line` is decorative only. Controls (inputs, selects, chips, secondary buttons) use `line-strong`; on the footer, `line-on-deep`.
- The navy and yellow used in ELC's video kit are **not** website colours.

## Typography

One family: **DM Sans** (Google Fonts; load with `next/font/google`, weights 400, 500, 700, 800, 900). The wordmark's Conthrax face appears only inside the logo files; never set text in it.

| Style | Use |
| --- | --- |
| `display` 72/1.02, 900 | Home hero only (scales down to about 40px on phones) |
| `h1` 58, 900 | Page titles |
| `h2` 44, 900 | Section headings (about 30px on phones) |
| `h3` 28, 800 / `h4` 21, 800 | Card and panel titles |
| `lead` 20 | Intro paragraph under a page title |
| `body` 17 / `body-sm` 15 | Running text / cards, tables, help text |
| `label` 15, 700 | Form labels, button text |
| `caption` 13 | Meta lines, timestamps |
| `eyebrow` 14, 800, uppercase, 0.08em | Section kickers, in `red-text` on light, `on-blue-muted` on blue |

Headings use one accent word in `blue` at most ("Making opportunities **accessible**").

## Layout, spacing and shape

- Content max width 1240px (`container`), 24px side padding. Sections are separated by background (`surface` / `blue-tint`), padded `space-8` (72px) on desktop and 48px on phones.
- Grids use `repeat(auto-fit, minmax(…, 1fr))` so cards reflow without breakpoints; the only hard breakpoint is `bp-phone` (820px) for the header and phone bar.
- Shape is soft and friendly: buttons, badges and chips are pills (`radius-pill`); cards `radius-lg`; feature panels and hero frames `radius-xl`; inputs `radius-md` (website) or `radius-sm` (portal).
- Elevation is rare: borders and background contrast separate things. Shadows only for floating items (`shadow-float`, `shadow-menu`, `shadow-bar`).

## Logo

Files are in **Assets → Logos**. Use the real files; never retype the wordmark.

- `elc-logo-stack.svg`: default, on white (header, documents).
- `elc-logo-stack-white.svg`: on `blue` or `blue-deep` (footer, portal sidebar, blue heroes).
- `elc-logo-wide.svg`: wide spaces such as email headers.
- `elc-mark.svg`: the emblem and star without words (favicons, avatars, video embeds).
- `elc-star.svg`: the red star alone, used as a small accent (bullets, badges, the hero tag). Not on blue.

Minimum height 40px for the stacked logo on screen; keep clear space of at least the star's width on every side. Don't recolour, stretch, outline or add effects.

The logo pattern (**Assets → Pattern**) is a light texture for large white areas at 7–12% opacity. Never behind text.

## Icons and imagery

- Icons: simple stroke icons on a 24px grid, 1.8px stroke, round caps and joins, in `blue` (or `on-blue` on blue). Lucide matches this style. No emoji, no filled clip-art.
- Photos: real ELC clients, staff, offices and passport drives, with written permission. No stock photos of graduates throwing caps. Avoid readable school signage.
- Until photos exist, placeholders are `blue-tint-strong` blocks with a bracketed description.

## Accessibility

Target WCAG 2.2 AA. Every text pair in this system passes 4.5:1 on the grounds its token note names. Focus is always visible with `focus-ring` (white gap, then a blue ring) on every link, button and field. Touch targets are at least 44px. Every field has a visible label, errors are written out in words, and colour never carries meaning alone.

## Components

The bundle exposes `window.ELC` (React 18). In the Next.js app, build the same components in `components/ui` with these class names and tokens.

| Component | Use |
| --- | --- |
| Button | Primary (blue), Secondary (outline), On blue (white), Red (Express, Subscribe only), Ghost |
| Badge | Short status or label, tone carries meaning only with its word |
| Field | Labelled input with hint, error and required marker |
| Chip | Single or multiple choice shown as pills (forms, filters) |
| Card | Service, programme and resource cards that link somewhere |
| Stepper | Progress through Start online forms |

Page patterns built from these (see the website canvas): Header with Services and Blog & Resources menus; Footer; phone action bar; service hero (blue band, breadcrumb, H1, lead, Start online + secondary, trust line); numbered steps; programme and video cards; Start online form; portal shell (blue-deep sidebar, `blue-tint` work area, white panels).

## Using this system in code

- Generate CSS variables from `tokens.json` (the page publishes `tokens.css`) into `styles/tokens.css`, and map them in Tailwind: `colors: { blue: 'var(--blue)', ... }`, `borderRadius`, `spacing`, `boxShadow`.
- Load DM Sans with `next/font/google` and set `--font-sans`.
- Keep component class names (`elc-btn`, `elc-badge`, …) or their Tailwind equivalents consistent with `components/bundle.css`.
