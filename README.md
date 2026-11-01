# elc-web

The new ernestlinksconsult.com (public site and "Start online" lead forms) and the ELC staff portal at `/portal`, in one Next.js app backed by Supabase.

## Run it locally

Requires Node.js 24 and, for the local database, Docker.

Needs Docker running.

```bash
npm install
cp .env.example .env.local
npm run db:start
npm run db:reset
npm run dev
```

Copy the API URL and anon key that `npm run db:start` prints into `.env.local`. The app runs at http://localhost:3000. `npm run db:reset` rebuilds the database from the migrations and `supabase/seed.sql`, `npm run db:test` runs the pgTAP tests, `npm run db:types` regenerates `lib/supabase/database.types.ts`, and `npm run db:stop` shuts the database down.

`npm run dev` falls back to `lib/site-config.ts` with a warning if the database is down. `npm run build` and `npm run test:e2e` need it running and fail without it.

The local ports are 443xx, not Supabase's default 543xx, because Windows reserves the default range on machines with Hyper-V.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npx playwright install chromium   # first time only
npm run test:e2e                  # end-to-end and accessibility tests
```

## Design tokens

`styles/tokens.css` is generated from `design-system/tokens.json`. Edit the JSON, then run `npm run tokens`; never edit the CSS by hand. The preview at http://localhost:3000/dev/tokens is available in development only.

## Specs

The specification lives in [docs/](docs/). Start with [CLAUDE.md](CLAUDE.md), which lists each document and the rules the code must follow. Design tokens and components are in [design-system/](design-system/), and page mockups are in [mockups/canvas/](mockups/canvas/).
