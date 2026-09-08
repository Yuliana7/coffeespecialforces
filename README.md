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

Configured for Railway, not yet applied. `.railway/railway.ts` is the whole
description of the Railway environment — the service, the volume, the start
command and the variables — and the CLI reconciles Railway to it:

```bash
railway login
railway link                 # pick (or create) the project + environment
railway config plan          # preview; reads only
railway config apply         # create the service and volume
railway variables --set PAYLOAD_SECRET="$(openssl rand -base64 32)"
railway domain               # generate the public domain
railway redeploy             # rebuild, so the domain is baked into the bundle
```

There is nothing to upload. Railway clones the repo, runs `pnpm build` in its own
container and then the start command in that image; `.next` stays gitignored.

**The first deploy will fail, and that is expected.** `apply` connects the GitHub
source and Railway builds immediately — before `PAYLOAD_SECRET` exists and before
there is a domain. Payload refuses to boot without a secret. The `redeploy` at the
end of the list is the deploy that counts. (If `plan` rejects `preserve()` because
the variable does not exist yet, comment that line out for the first apply and
restore it once the variable is set.)

`railway domain` (or the **Generate Domain** button) asks which port to route to
whenever it cannot detect one from a running deployment — which is the case here,
since the first deploy crashes before it listens. The answer is **3000**, pinned as
`PORT` in the config.

Two ordering traps in that list:

- `NEXT_PUBLIC_*` is inlined by Next at **build** time, so the domain has to exist
  before the build that ships. Generated domains are not part of the config file,
  which is why the domain is created and then the service redeployed. Adding a
  custom domain later needs a rebuild, not a restart.
- The **first admin account is a race** — see below. Open `/admin` and create it
  before the URL is shared with anyone.

The rest of the reasoning is in `CLAUDE.md`:

- `NEXT_PUBLIC_SERVER_URL` must exactly match the public origin, or the admin panel
  will reject every save.
- Schema auto-push is **development only**. In production Payload expects
  migrations, so `src/migrations` is committed and the start command runs
  `pnpm payload migrate`. Re-run `pnpm payload migrate:create <name>` after any
  schema change and commit the result. Migrations run in the **start** command
  rather than a pre-deploy one, because Railway does not mount volumes for the
  pre-deploy container — a migration there would write to a throwaway disk.
- **Create the admin account before sharing the URL.** Payload shows a "create
  first user" screen to whoever reaches `/admin` while the users table is empty —
  there is no invite step, so on a fresh production database that is open to anyone
  who finds the URL. Open `/admin` yourself as soon as the first deploy is live.
  `pnpm seed` is _not_ the way to do this in production: `railway run` executes
  locally against a database it cannot reach, and the script also inserts sample
  content. It stays a development convenience.
- Login is by **username**, not email, and no email adapter is configured — so there
  is no "forgot password" mail. A locked-out admin is reset by another admin, or from
  the CLI. Add an email adapter if that becomes a problem.
- SQLite needs a persistent disk, as do the uploads. Both live on one Railway
  volume mounted at `/data`, via `DATABASE_URI` and `MEDIA_DIR`. Uploads are served
  by Payload's own `/api/media/file/**` route, so they do not have to sit in
  `public/`. Going serverless does **not** require Postgres: the adapter is libsql,
  so pointing `DATABASE_URI` at a hosted libsql/Turso URL keeps the same adapter
  and schema. Uploads would still need to move to object storage via
  `@payloadcms/storage-s3`.
- That disk also means **one instance only** — no replicas, and a few seconds of
  downtime on each redeploy. Fine at this scale, but it is the constraint to
  remember if the site ever needs to scale out.

## Not built yet

Payment integration, contact form, analytics, image CDN, draft previews.

`/sitemap.xml` and `/robots.txt` are generated from the CMS — see `src/app/sitemap.ts`.
