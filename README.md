# Coffee Special Forces

Website and CMS for **Кава Спецпризначення** — a Kyiv coffee shop whose profits fund
fundraisers for the military, tactical medicine training and veteran support.

Bilingual (Ukrainian default, English second) and edited entirely through a built-in
admin panel, so no code changes are needed to publish content.

Built with Payload CMS 3, Next.js 16, React 19, Tailwind 4 and SQLite. Payload runs
_inside_ the Next app — one project, one command, one database.

## Requirements

- Node.js 20.9+ (developed on 26)
- pnpm 10+ (developed on 12)

No database server to install: SQLite is a single file in the project.

## Getting started

```bash
pnpm install
cp .env.example .env      # then fill in PAYLOAD_SECRET
pnpm seed                 # creates the database, an admin user and demo content
pnpm dev
```

Generate the secret with `openssl rand -base64 32`.

- Site — <http://localhost:3000> (redirects to `/uk`)
- Admin — <http://localhost:3000/admin>

`pnpm seed` signs you in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`
(username `admin` / password `changeme123` by default — **change these**). It is safe to
re-run; it skips anything that already exists.

### The database

SQLite, stored at `./coffeesf.db` and git-ignored. Payload creates and migrates the
schema automatically in development, so there is nothing to run by hand. To start
over, delete the file and run `pnpm seed` again.

Uploaded images and PDFs go to `public/media`, also git-ignored.

## Scripts

| Command                     | What it does                                         |
| --------------------------- | ---------------------------------------------------- |
| `pnpm dev`                  | Run site + admin at localhost:3000                   |
| `pnpm build` / `pnpm start` | Production build and server                          |
| `pnpm seed`                 | Create admin user and demo content (idempotent)      |
| `pnpm generate:types`       | Regenerate `src/payload-types.ts` after schema edits |
| `pnpm lint`                 | ESLint                                               |

## Structure

```
scripts/seed.ts               Demo content in both languages
src/
  payload.config.ts     Collections, globals, locales, database
  collections/          Projects, Events, WorkAreas, Locations, Media, Users
  globals/              Home, Foundation, Donate, SiteSettings (single-record pages)
  app/
    (payload)/          Admin UI and REST/GraphQL API — generated, leave alone
    (frontend)/[locale] The public site
  components/           Header, Footer, cards, ProgressBar, DonateBlock, RichText
  lib/                  Locale helpers, UI strings, formatters, media helpers
public/logo.jpg         Logo, used when none is uploaded in Site settings
```

**Collections** are lists (many projects, many events). **Globals** are one-off pages
(the home page hero, the foundation page, donation details).

Every event belongs to a work area — that link is what builds the work areas page,
where each area shows its latest events.

## Editing the site

Everything is in the admin panel, grouped as Content / Pages / Settings. The panel
itself is available in Ukrainian and English, and each translatable field has a
locale selector at the top right.

- **Fundraising totals** are entered by hand on each project. Set a goal to show a
  progress bar; leave it empty to hide it.
- **Donation details** (monobank, PayPal, IBAN) live in one place and appear on the
  donate page, the foundation page and every project.
- **Slugs** fill themselves in from the title, transliterating Ukrainian to Latin.

## Design

The palette comes from the logo — Ukrainian blue and yellow, the emblem's olive, and
a warm off-white. All six colours are CSS variables at the top of
`src/app/(frontend)/globals.css`; change them there and the whole site follows.

## Deployment

Not set up yet. The short version — `CLAUDE.md` has the full reasoning:

- `NEXT_PUBLIC_SERVER_URL` must exactly match the public origin, or the admin panel
  will reject every save.
- Schema auto-push is **development only**. In production Payload expects
  migrations, so the deploy has to run `pnpm payload migrate:create` once locally,
  with `pnpm payload migrate` in the start command.
- **Create the admin account as part of the deploy.** Payload shows a "create first
  user" screen to whoever reaches `/admin` while the users table is empty — there is
  no invite step, so on a fresh production database that is open to anyone who finds
  the URL. Run `pnpm seed` (it reads `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`)
  in the deploy, or at least create the account before sharing the URL.
- Login is by **username**, not email, and no email adapter is configured — so there
  is no "forgot password" mail. A locked-out admin is reset by another admin, or from
  the CLI. Add an email adapter if that becomes a problem.
- SQLite needs a persistent disk, as does `public/media`. The simplest fix is a host
  that gives you one (Railway, Fly, any VPS). Going serverless does **not** require
  Postgres: the adapter is libsql, so pointing `DATABASE_URI` at a hosted
  libsql/Turso URL keeps the same adapter and schema. Uploads would still need to
  move to object storage via `@payloadcms/storage-s3`.
- That disk also means **one instance only** — no replicas, and a few seconds of
  downtime on each redeploy. Fine at this scale, but it is the constraint to
  remember if the site ever needs to scale out.

## Not built yet

Payment integration, contact form, analytics, image CDN, draft previews.

`/sitemap.xml` and `/robots.txt` are generated from the CMS — see `src/app/sitemap.ts`.
