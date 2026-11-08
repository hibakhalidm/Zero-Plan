# Zero Plan / SheConnects MVP

Next.js App Router, TypeScript, Tailwind, Lucide, Supabase, and a custom offline service worker. All six views work with bundled educational content before database configuration. Demo metrics and sample answers are labelled.

## Run

Use Node.js 22 or newer and npm:

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:3000. For the isolated demo moderator console, set `DEMO_MODE=true` before starting; its passcode is `zeroplan2026`. Without that flag, a production build fails closed when admin credentials are missing. `npm run dev` is for UI development; use the production build for offline verification.

## Connect the programme database

1. Apply `supabase/schema.sql` in a new Supabase project's SQL editor. It creates tables, checks, column grants and RLS. Run it once; the named policy declarations are not an idempotent migration system.
2. Copy `.env.example` to `.env.local`. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, a strong unique `ADMIN_PASSCODE`, and `DEMO_MODE=false`. Never expose the service role key through a `NEXT_PUBLIC_` variable.
3. Populate `club_chapters` with verified programme records. Demonstration chapter counts are deliberately not automatically seeded into production.
4. Configure `NEXT_PUBLIC_SPONSOR_EMAIL` and/or `NEXT_PUBLIC_SPONSOR_WHATSAPP` (international digits only) with the project lead's verified contacts, then rebuild.
5. Deploy the complete Next.js server to a Node-compatible HTTPS host, including `public` and the generated offline files. This repository has not been deployed to a public host. It is not a static-only export or a Sites Worker bundle.

## Offline behavior

`npm run build` copies all six prerendered pages into `public/offline-pages` and generates an asset manifest from the build. The worker precaches those pages, JS, CSS, icons and the content bundle. The Offline Ready badge appears only after caching succeeds. A first successful online visit is required. API responses are never cached by the worker.

Local storage holds learning progress, helpful votes, chapter choice, the public snapshot and pending questions. Each question keeps its UUID across retries; database upserts ignore duplicate IDs. Install registration uses a separate random identifier and is never attached to a question. Sync retries while the app is open, on connectivity changes, and once per minute. It cannot run after the browser closes.

Quick Exit or double Escape replaces the app with a GPA calculator. Three quick clicks on its version restore the app. Clear local data removes local questions, progress, identifier and caches, aborts current transfers, and unregisters the worker. Neither option clears browser/network history or recalls already received questions.

## Verification

With a production preview running in isolated demo mode:

```sh
npm run lint
npm test
```

Tests cover page availability, offline asset completeness, authorization, invalid submissions, safe failure without a database, content inventory, queue retries, concurrent synchronization, privacy pause and storage failure. Live Supabase integration and deployed RLS require credentials and a test database; those have not been exercised here.

Browser checks completed during development: Quick Exit, GPA math, triple-click return, double Escape, guide search, article reading, reading-progress persistence, library navigation and sisterhood rendering with the origin server stopped. The last browser submission check was inconclusive; unit tests exercise queue insertion and transfer behavior. Full device/network-off testing, mobile installation and connected moderation remain release checks.

## Before a youth-facing release

The content sources and verification limits are recorded in `content-sources.md`. Obtain local clinical and safeguarding review, verify referral contacts/hours and the actual chapter data, confirm the funding attribution, and configure sponsor contacts. The public-health information numbers are not represented as suicide/crisis hotlines. No school or shelter phone number is invented.

Add host-level abuse protection and rate limiting for anonymous submissions and moderator authentication, and establish log minimization, access control, retention and deletion procedures. A shared passcode is the requested MVP gate, not a full staff identity/audit system. Anonymous free text can contain identifying information despite the form warning; moderators must review questions before publication. Currently the console edits answers, so identifying question text must be redacted in the database before publishing.

Browser registrations are an approximation of installations, not verified unique people. Clearing storage can increment the count again. Demo chapters must never be reported as verified programme achievements.

## Structure

- `src/app`: six routes and server API handlers
- `src/components`: interface, calculator cloak and install controls
- `src/lib`: local queue, types, triage and server access
- `src/data/offline-bundle.json`: 12 guides, 6 pathways, 6 sample Q&As, 3 demo chapters
- `supabase/schema.sql`: database security and structure
- `public/sw.js`, `scripts/build-offline.mjs`: offline preparation
- `tests`: HTTP/security and storage behavior checks

Full document navigation is intentional: each route is independently cached as HTML, avoiding reliance on a network-only App Router transition while offline. The corresponding Next Link lint rule is disabled for this reason.
