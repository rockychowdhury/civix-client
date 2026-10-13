# Civix Client - Civic Reporting and Dispatch Frontend

Frontend for Civix, a civic platform where residents report street-level problems and track resolution. Citizens file in under a minute, departments triage and dispatch, technicians resolve from the field.

**Live app:** add your Vercel URL here | **API repo:** [civix-api](https://github.com/rockychowdhury/civix-api)

## Why this exists

The product promise is simple: a report never disappears into a void. Every report gets a tracking number, a public status ledger, and a responsible department with a deadline.

## What it does (by user)

- Citizen: description-first report flow with fuzzy category matching, photo upload, and shareable tracking page with status history.
- Department staff: triage raw service requests, confirm or merge duplicates into one civic issue, manage the issue queue by SLA urgency.
- Dispatcher: confirm suggested technicians inline on the work order row, reassign when no one is available, monitor field progress live.
- Technician: mobile-first queue sorted by SLA, accept jobs, post work updates with photos, submit one final resolution.

## Tech

Next.js 16, React 19, TypeScript, TanStack Query, TanStack Form, TanStack Table, ofetch, Tailwind CSS v4, Zod, Biome

- Static shell with live query islands: pages ship static, operational data stays live via TanStack Query with cache patching (no full list refetch on actions).
- Client-side category matcher with stemming, synonyms, and fuzzy match to route reports correctly despite typos and Bangla mixed text.
- URL-synced filters so any queue view is shareable inside a team.

## Run locally

```bash
git clone https://github.com/rockychowdhury/civix-client.git
cd civix-client
npm install
cp .env.example .env
# set NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm run dev
```

App runs on `http://localhost:3000`. Needs `civix-api` running.

## Structure

```
src/
  app/           # SSG shells only, no per-request data fetch
  api/           # typed ofetch functions per domain
  hooks/         # useQuery and useMutation wrappers
  components/    # tables, forms, sheets, shared UI
  lib/           # category-matcher, utils, validators
```

## Author

Rocky Chowdhury, Backend Developer, Dhaka, Bangladesh
Portfolio: https://rockychowdhury.vercel.app | LinkedIn: https://linkedin.com/in/rockychowdhury1
