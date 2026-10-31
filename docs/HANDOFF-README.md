# ErnestLinks Consult — Website & Staff Portal Handoff Pack

Everything needed to start building the new ernestlinksconsult.com and the ELC staff portal with Claude Code, Next.js and Supabase. Prepared 31 Oct 2026.

## What's inside

| Folder / file | Contents |
| --- | --- |
| `docs/00-Website-Audit-Oct-2026.md` | Audit of the current site: critical issues, page-by-page findings, speed, SEO, content conflicts |
| `docs/01-PRD.md` | Product requirements: goals, metrics, roles, scope, phases, all requirements (W-, F-, P-), non-functional requirements, integrations, house rules, release checklist, risks, open questions |
| `docs/02-Information-Architecture.md` | Sitemap, every page and URL, navigation, redirects from the old site |
| `docs/03-System-Architecture.md` | System overview, lead capture flow, tech stack, repo structure, environments, caching, security |
| `docs/04-Data-Model-ERDs.md` | Two ERDs, enums, 25 tables, row-level security rules, key SQL, form definition types |
| `docs/05-Design-Spec.md` | Design principles, tokens, page templates, component inventory, states, responsive rules, images, build order |
| `docs/06-Project-Summary.md` | One-page summary of every decision made so far |
| `docs/word/` | The same documents as Word files (.docx) for sharing with the team |
| `diagrams/` | Sitemap, system overview, lead capture flow and both ERDs as SVG and PNG |
| `design-system/` | ELC Design System: `tokens.json`, brand README, component READMEs and HTML previews, React bundle (`components/bundle.js`, `bundle.css`, `index.d.ts`) |
| `brand/` | Logo files (SVG + PNG, web-ready `web-*.svg` versions with outlined text), red star, pattern tile |
| `mockups/canvas/` | Source of every mockup artboard (`*.dc.html`) and `canvas.json` (page grouping). These render inside the Claude canvas; open the live link below to view them |
| `starter/CLAUDE.md` | Drop-in `CLAUDE.md` for the root of the code repository |
| `starter/tokens.css` | CSS variables generated from `tokens.json`, ready to use as `styles/tokens.css` |

## Live versions (always the most current)

- PRD & technical specification: https://claude.ai/artifact/SGZQ2ovDAcxgM9LJeHPB9B
- Design system: https://claude.ai/artifact/YCuh2kDc3RYkR3SeXdzLg5
- Website & portal mockups (canvas): https://claude.ai/artifact/4KgPH8WmTuLGxzgduWZhdL
- Website audit: https://claude.ai/artifact/HXvYFX7mD2EM8SB5CnWCXZ

If a file here and the live link disagree, the live link is newer.

## How to start with Claude Code

1. In ELC's GitHub organisation, create a private repository `elc-web` and clone it.
2. Copy into the repo root: `starter/CLAUDE.md` → `CLAUDE.md`; the `docs/`, `diagrams/` and `design-system/` folders; `brand/` → `public/brand/`; `starter/tokens.css` → `styles/tokens.css`.
3. In Supabase, create two projects: `elc-staging` and `elc-production` (region close to Ghana, e.g. EU West). In Vercel, import the repo into ELC's team on the paid plan.
4. Open the repo in Claude Code and say: *"Read CLAUDE.md and docs/05-Design-Spec.md. Do build step 1 only."* Then continue one numbered step per session.
5. Before Phase 1 launch, work through the release checklist at the end of `docs/01-PRD.md`.

## Still to decide (from the PRD)

Who controls DNS for ernestlinksconsult.com; express passport timeline and whether prices include the government fee; birth certificate price; documents-to-bring list; reply-time promise and owner per service; official MoMo name and number; LIVE topic and time per weekday; exam fees and schedule; travel quote turnaround; Dubai openings; payment, refund and privacy text; team and office photos; drive dates and headcounts; testimonials with written permission.
