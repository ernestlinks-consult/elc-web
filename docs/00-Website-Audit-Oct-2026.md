# ErnestLinks Consult Website Audit (Oct 2026)

Oct 31, 2026 · @Goddy

## Verdict

Rebuild, don't patch. ernestlinksconsult.com is a WordPress theme ("Gtbus" by ThemeXriver) that was exported to static files with only the homepage, About, Services and Contact rewritten. Half the public pages still show the theme's demo content, the contact form sends messages to the theme vendor's server, and the homepage downloads about 28 MB and takes about 15 seconds to finish loading.

- The homepage copy is mostly right and worth keeping. The structure, code and inner pages are not.
- The site never sends anyone to the booking page (ernest-links-frontend.vercel.app/book), so it captures no leads by itself.
- Searching "ErnestLinks Consult Kumasi" surfaces a directory listing, not the site: there is no sitemap, robots.txt, structured data or social preview.

| Area | Score /10 | One-line reason |
| --- | --- | --- |
| Content accuracy | 4 | Homepage is right; FAQ, Projects, Success Stories and Blog are demo text |
| Lead capture | 2 | Broken form, no booking link, CTAs that go nowhere |
| Trust | 3 | Fake addresses on inner pages, no testimonials, unexplained partner logos |
| Speed | 2 | 28 MB, 100 requests, two 10 MB images |
| SEO basics | 2 | Relative canonical, no sitemap/robots/OG/schema, theme titles |
| Mobile | 6 | Layout holds at 375 px, but the page is about 19 screens long |

Audited 31 Oct 2026 by opening every linked page in a browser; scores are judgement, not a tool score.

## Critical issues to fix this week

These six can embarrass ELC or lose clients today, before any rebuild ships.

1. **The contact form sends enquiries to the theme vendor.** On /contact/ the form posts to `themexriver.com/wp/gtbus/contact/`. Nobody at ELC receives these messages, and a student's name and email go to a third party. Hide the form now and point people to WhatsApp.
2. **Demo pages are live and linked from the menu.** /projects/, /project-masonry/ ("Success Stories"), /faqs/ and /projects/projects-details/ show Latin filler text, "Client Name: Themeforest.Validthemes.Com, Budget $5014USD", "Award-Winning Consulting Company" and "150k+ creators".
3. **Fake contact details on those pages.** Their footer reads "address: orange, USA · email: example@gmail.com · phone: +880 123 456 789 · ©copyright 2024 by Company". A student who lands there will doubt ELC is real.
4. **The blog is the theme's demo blog.** /blog/ lists "Unique Things You Need to Know About Interior Business" and wellness posts by "Tacktor". The two ELC posts on the homepage link to those unrelated demo URLs, which now return 404.
5. **Broken links in the main menu.** "Success Stories" (/clients/) is a 404. Team profiles, blog categories and both homepage blog links are 404s. "Resources" and footer "Contact" go nowhere (#).
6. **Wrong data in page code.** The homepage has a phone link to `+125 6952 558` and an email link to `mailto:email.com`, both theme leftovers. The copyright says "Goddy Smart Labs" instead of ErnestLinks Consult.

## Page-by-page findings

Five of the twelve linked pages are usable; the rest are demo content or missing.

| Page | Status | What's wrong | Keep? |
| --- | --- | --- | --- |
| Home | Live, ELC content | 15 s load; "Explore Programs" has no link; "Explore more" under "Request a Schedule" goes to Services, not booking; team card typo "Chief Eexecutive Officer"; expedited package lists "Intellect and Experience" and "Experienced Peoples" as features; partner logos have no names (likely theme placeholders) | Copy yes, build no |
| About Us | Live, ELC content | Good story, purpose, vision, mission and values; empty "Our Partners" block; "trusted by hundreds" vs "thousands" on Home | Yes, tightened |
| Services | Live, mixed | Repeats the homepage; menu still lists theme pages (Shop, Cart, Checkout, Pricing Table, Service One/Two) | Merge into service pages |
| Service details | Live, Passport only | Only one service has a page; the theme's full demo menu (Home 01/02/03, Shop) and a stray "ss" search label show | Yes, as one page per service |
| Projects | Demo | Title "Projects – Gtbus", Latin filler, fake footer | Delete |
| Project details | Demo | "Mobile App" case study, Latin filler | Delete |
| Success Stories (/project-masonry/) | Demo | "Interested in Giving Back This Year" x5 | Replace with real stories |
| Success Stories (/clients/) | 404 | Linked from the menu | Delete link |
| FAQs | Demo | "Award-Winning Consulting Company", "Business Setup Growth 90%" | Rewrite |
| Blog | Demo | Interior-business and wellness posts by "Tacktor" | Rewrite or hide |
| Contact | Live, ELC content | Form posts to themexriver.com; no map; hours stated two ways (8am–5pm vs 08:00–17:00) | Yes, with a working form |
| Team details | 404 | Linked from all three team cards | Replace |
| 404 page | Live | Fine | Yes |
| sitemap.xml, robots.txt | 404 | Missing | Add |

## Speed and technical

On mobile data in Ghana the homepage costs a visitor about 28 MB and 15 seconds; a site this size should be under 1.5 MB and 3 seconds.

| Measure (homepage, measured in browser) | Now | Target |
| --- | --- | --- |
| Page weight | 28,304 KB | < 1,500 KB |
| Requests | 100 | < 30 |
| Fully loaded | 15.1 s | < 3 s |
| Scripts / stylesheets | 35 / 29 | a handful |
| Images lazy-loaded | 0 of 47 | all below the fold |

- Two images are 10 MB each: `p1-img-1.png` and `p1-img-2.png`, 3,160 px wide PNGs used as small passport-package pictures. These alone are 75% of the page.
- Three Font Awesome icon fonts (about 1.3 MB) load for a few icons. A preloader logo hides the page while all this loads.
- The page still loads files from themexriver.com, the theme vendor.
- The logo's wordmark (`logo-22.svg`) uses the Conthrax font as live text, which visitors don't have, so "ERNEST LINKS CONSULT" renders in a fallback font. Convert the text to outlines.

**SEO basics**

- Canonical tag is the relative `index.html`, not `https://ernestlinksconsult.com/`.
- No sitemap.xml or robots.txt; no Open Graph or Twitter tags, so WhatsApp and Facebook shares show no preview image.
- No LocalBusiness structured data, so Google can't connect the site to the two Kumasi offices.
- Inner page titles still say "– Gtbus"; most have no meta description.
- No analytics (no Google Analytics, Meta Pixel or similar), so ELC can't tell how many people visit or where they come from.
- Searching "ErnestLinks Consult Kumasi" returned a directory listing, not the site. Register it in Google Search Console and claim the Google Business Profile for both offices.

## Content, accuracy and consistency

The site, the booking page and ELC's own videos disagree on prices and on whether a consultation is free; settle these before the new site goes live.

| Topic | Website says | Elsewhere says | Decide |
| --- | --- | --- | --- |
| Consultation | "Request a Schedule For Consultation" (no price) | Booking page: GH¢100 / 30 min, GH¢200 / 1 hr, paid by MoMo. LIVE guides and videos say "free consultation" | Free or paid? |
| Passport, standard | GH¢700, up to 4 weeks | Passport video: GH¢600, within a month | Which price is current? |
| Passport, expedited | GH¢1,500, 10–15 working days (FAQ only) | Passport video never gave the express price | Confirm |
| Opening hours | Mon–Fri 8:00–17:00 | Booking: Mon and Wed, 10:30–14:30 only | Explain walk-in vs booked slots |
| Proficiency exams | "Tuition" for SAT, IELTS, GMAT, GRE | Booking: "Registration" for IELTS, TOEFL, GRE, GMAT, SAT | Tuition, registration, or both? |
| Phone numbers | +233 53 778 3166 and hotline 032 229 1161 | Standard contact line adds +233 20 401 0168 | Add the second number |
| Service names | "Work & Study Abroad" and "Study & Work Abroad"; "Passport & Birth Certs" vs "Passport and Biometric Birth Certificate" | Booking: "Passport & ID Services", "Tours & Travel Solutions" | One name per service |

**Claims to source or soften**

- "90% Client Satisfaction Rate" has no survey behind it that the site shows.
- "500 Passports Processed Successfully" sits next to an FAQ claiming "thousands of students and travelers". Use one real, current number.
- The four mass passport drives have no dates or headcounts, so they read as undated.

**Missing from the site**

- Work abroad offers ELC now promotes (Dubai hospitality, Malta nursing bridging) and destinations beyond USA/UK/Canada/Germany (Malta, Ireland).
- Scholarship Hunt, the WhatsApp keywords, and the weekly Friday TikTok LIVE.
- Birth certificate, visa, exam and travel prices or "from" prices (the business review notes visa processing as GH¢20,000 with a promo to GH¢16,000; the house rule is not to show it publicly unless you decide to).
- A refund and payment policy, a privacy notice, and terms.

## Trust and conversion

A student who wants help today has one working path, the passport "get now" WhatsApp buttons; every other service ends in a dead link, a demo page or a form nobody reads.

- **No route to booking.** The paid booking page exists, but no button on the site links to it. "Start consult" goes to the contact page with the broken form.
- **One WhatsApp path for one service.** Only the two passport packages open WhatsApp with a pre-filled message. Study abroad, exams and travel have no equivalent, and no WhatsApp keyword, so web leads can't be traced the way video leads are.
- **No proof.** No testimonials, no client photos, no named results. Partner logos have no names, and on inspection look like the theme's sponsor placeholders.
- **No floating WhatsApp button** on mobile, where most visitors will be.
- **Too long on mobile.** The homepage is about 15,400 px tall at 375 px wide (about 19 screens), with travel cards that all link to the same demo page.
- **The booking page reads as internal.** Its browser title is "Ernest Links Consult — CRM" and it shows a "Staff login" link to the public. Rename it and move staff login out of sight.
- **Team cards lead nowhere.** All three link to a 404, and social icons on them are #.

What works: the hero line "Making Opportunities Accessible", the clear four-service split, the passport package cards with prices and inclusions, the two office addresses, and the WhatsApp channel invite.

## Rebuild plan

The new site is eight hand-built pages with no theme, under 1.5 MB, where every page ends in WhatsApp (with its own keyword) or the booking page.

| Page | Job | Main action | WhatsApp keyword |
| --- | --- | --- | --- |
| Home | Say what ELC does in 5 seconds, prove it, route to a service | Book / WhatsApp | HELLO |
| Passports & Birth Certificates | Packages, prices, timelines, documents needed, mass drives for associations | WhatsApp a package | PASSPORT / DRIVE |
| Study Abroad | Destinations, the ELC path step by step, what it costs in principle, visa readiness | Book a consultation | STUDY |
| Work Abroad | Current honest offers (no job guarantees), how it works | WhatsApp | WORK |
| Proficiency Exams | IELTS, TOEFL, SAT, GRE, GMAT: registration and prep | WhatsApp | EXAMS |
| Travel & Tours | Flights, hotels, conferences, tourist visas | WhatsApp | TRAVEL |
| About | Story, team, offices, values | Visit / call | — |
| FAQ & Contact | Real questions, both offices with maps, hours, working form | Book / WhatsApp | — |

Also: a Scholarship Hunt block that sends people to the WhatsApp channel, real testimonials once clients agree in writing, sitemap, robots.txt, LocalBusiness data, share previews, analytics, and a privacy notice.

**Decisions for Goddy**

- [x] Consultation: free help happens on the TikTok LIVE every weekday afternoon (a different host each day). The paid consultation (GH¢100 / 30 min, GH¢200 / 1 hr) is a one-on-one with the CEO for deeper cases. Update the LIVE guides and videos that call the booking a "free consultation".
- [x] Passport: standard GH¢600, express GH¢1,800 (the current site's GH¢700 / GH¢1,500 are out of date).
- [ ] Show any study abroad or visa prices, or none (current house rule: none)?
- [x] Exams: both registration and tuition.
- [ ] Which partner logos are real partners ELC may name?
- [ ] Who receives website form messages (office@ernestlinksconsult.com?) and who answers within 24 hours?
- [x] Next step: design mockups for approval before any code.
- [ ] Hosting: keep the current host and upload new files, or move to a free static host?

> Note added in the handoff pack: later decisions superseded parts of this rebuild plan. Study Abroad is now two pages (School Applications and Visa Applications), "Start online" forms are the primary action, and hosting is Vercel + Supabase. See `01-PRD.md`.
