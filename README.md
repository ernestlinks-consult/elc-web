# elc-web

The new ernestlinksconsult.com (public site and "Start online" lead forms) and the ELC staff portal at `/portal`, in one Next.js app backed by Supabase.

## Run it locally

Requires Node.js 24 and, for the local database, Docker.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:3000. To run the database too, use `npm run db:start`, then copy the URL and keys it prints into `.env.local`. `npm run db:reset` rebuilds it from the migrations and `npm run db:stop` shuts it down.

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
