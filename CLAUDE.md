@AGENTS.md

# Working on this repo

Payload CMS 3.88 + Next.js 16 + React 19 + Tailwind 4 + SQLite. Payload runs inside
the Next app; there is no separate CMS server. See `README.md` for setup.

The notes below are things that cost real debugging time here. Read them before
changing config — most of these fail silently or with a misleading error.

## Gotchas

### `serverURL` must match the real origin, or every save fails with 403

Payload adds `serverURL` to its CSRF allowlist, and refuses cookie auth for any
request whose `Origin` is not on that list. The failure is confusing because **reads
keep working**: same-origin `GET`s don't send an `Origin` header, so only mutations
are rejected. Symptom is `POST /api/payload-preferences/… 401` plus
`PATCH /api/<collection>/<id> 403 "You are not allowed to perform this action."`,
which reads like a permissions bug rather than a config one.

`src/payload.config.ts` therefore only sets `serverURL`/`cors`/`csrf` in production,
where the origin is known. In development Payload derives the origin from the
request, so it survives Next falling back to another port when 3000 is taken.

In production `NEXT_PUBLIC_SERVER_URL` must be exactly the public origin.

### Schema auto-push is development-only

`@payloadcms/db-sqlite`'s `connect.js` gates it on `NODE_ENV !== 'production'`, so
the schema that appears by itself in development will **not** appear on a deployed
instance. Production needs `payload migrate:create` committed and `payload migrate`
run at start. Nothing warns you; the app just fails against an empty database.

### Payload config is read once at server start

Editing `payload.config.ts`, collections or globals does **not** hot-reload. Restart
`pnpm dev` or you will be testing the old config and drawing wrong conclusions.

### Frontend pages must stay dynamic — Payload does not invalidate Next's cache

`src/app/(frontend)/[locale]/layout.tsx` sets `export const dynamic = 'force-dynamic'`.
Without it Next prerenders the listing pages at build time and CMS edits do not
appear on the live site until the next deploy. Don't remove it.

It is tempting to assume Payload handles this, since it runs in the same process.
It does not: there is not a single `revalidatePath`/`revalidateTag` reference in
`payload` or `@payloadcms/next`. Payload is host-agnostic and has no idea which
routes render which documents. Payload's _website template_ wires it up by hand, in
`templates/website/src/collections/Pages/hooks/revalidatePage.ts`, calling
`revalidatePath` from an `afterChange` hook — that is the pattern to copy if caching
is ever wanted here.

Our pages await only `params` and Local API queries — no dynamic APIs — so without
the export Next considers them fully static. Confirm which way a build went by
reading `.next/prerender-manifest.json`: it should list only `/_not-found` and
`/_global-error`.

Next 16's `cacheComponents: true` would flip the default (uncached IO becomes
dynamic, making the export unnecessary), but invalidation would _still_ be manual
via `revalidateTag`. It is not enabled in Payload's 3.88 template; leave it off.

### Rich text does not link to other documents out of the box

Two separate holes in Payload's default JSX converters, both silent:

- `defaultJSXConverters` builds its link converter as `LinkJSXConverter({})` — with
  no `internalDocToHref`. A link to another document therefore cannot become a URL
  and renders `href="#"`, with an error only on the server console.
- There is **no `relationship` converter at all**. The editor's Relationship node
  renders _nothing_ — no element, no warning, no gap in the markup to notice.

`src/components/RichText.tsx` supplies both. Its `COLLECTION_PATHS` map is the
single place a collection is turned into a frontend path, so a new collection with a
detail page needs one line added there — and a matching entry in
`LINKABLE_COLLECTIONS` in `src/payload.config.ts`, which controls what the editor's
link picker offers.

`internalDocToHref` is **synchronous**, so the referenced document must already be
populated: query rich text with `depth >= 1`. At `depth: 0` the node holds a bare
id, and `docHref` falls back to the collection listing rather than a dead link.

### Admin login is by username, and changing that on an existing database hurts

`src/collections/Users.ts` sets `loginWithUsername` with `allowEmailLogin: false`
and `requireEmail: false`, because no email adapter is configured — Payload's
password-reset and verification flows have nothing to send with, so asking for an
address would imply a recovery route that does not exist.

Switching an auth collection between email and username **adds a NOT NULL column**.
On a database that already has users, the schema push stops with a data-loss warning
and waits for a `y/N` answer, which looks like a hang in a non-interactive shell.
Either backfill the column before flipping the setting, or write a migration.

### `payload run` scripts need top-level await

The CLI imports the file and exits as soon as the import settles. A script that
calls `main()` without awaiting it at the top level exits **silently with code 0**
before any of the work runs — no output, no error. `scripts/seed.ts` ends with a
bare `await seed()` for exactly this reason.

### Writing a second locale duplicates array rows unless you pass row ids

Array fields (`stats`, `methods`, `reports`, …) are shared between locales — only the
fields _inside_ them are translated. Writing the English pass without each row's `id`
appends a second set of rows instead of translating the existing ones. `scripts/seed.ts`
carries the ids across in `withRowIds`; do the same anywhere else that writes both
locales.

For non-array fields, only send genuinely localized fields in the second pass; the
rest are shared and were already written by the first.

### Tailwind must never reach the admin panel

The CSS import lives only in `src/app/(frontend)/[locale]/layout.tsx`. The
`(payload)` route group owns the admin UI and must keep its own styling. Adding a
global stylesheet there will wreck the admin.

### `next/image` and files in `public/`

Payload's template pins `images.localPatterns` in `next.config.ts` to CMS uploads
only, which makes `next/image` reject anything else in `public/` with an
"Invalid src prop" runtime error. A pattern for top-level public assets has been
added. Note SVGs aren't optimized by `next/image` anyway — serve those with a plain
`<img>`.

Also worth knowing before reaching for `next/image` on CMS content: Payload already
runs `sharp` at upload time and stores `thumbnail`/`card`/`hero` variants, so
optimizing those again is redundant work — and on a self-hosted box it is your own
CPU paying for it.

### Tooling versions

- **TypeScript 7 removed `baseUrl`.** It's dropped from `tsconfig.json`; `paths`
  entries are relative and resolve without it. The project compiles clean under both
  5.7 and 7 — don't re-add it.
- **pnpm 12 renamed the install-scripts allowlist** to `allowBuilds` in
  `pnpm-workspace.yaml`. `pnpm.onlyBuiltDependencies` in `package.json` is silently
  ignored and the install fails with `ERR_PNPM_IGNORED_BUILDS`.
- `AGENTS.md` is regenerated by `next dev`. It hosts Next's managed block, which is
  why this file is safe to edit — the generator skips `CLAUDE.md` when `AGENTS.md`
  already hosts the block.

## Deployment & hosting

Nothing is deployed yet. These constraints follow from SQLite-on-disk and are worth
knowing _before_ picking a host, because they are awkward to undo later.

### The persistent disk means exactly one instance

`coffeesf.db` and `public/media` both live on local disk, so every request has to
land on the machine holding them. On Railway specifically that is enforced:
replicas cannot be used with a volume, a service gets one volume, and each redeploy
takes a few seconds of downtime because two deployments are never allowed to mount
the same volume at once. Health checks do not avoid this.

That is a property of the storage choice, not of Railway — any single-file database
on a local disk behaves this way. It is fine at charity-site traffic; one container
plus a CDN in front will not be the bottleneck. Vertical scaling stays available.

The way out, if it is ever needed, is to empty the disk rather than to switch
databases:

1. Move uploads to object storage with `@payloadcms/storage-s3` (Cloudflare R2 is
   S3-compatible and has no egress fees). `src/lib/media.ts` is the single place
   URLs are built, so that is the switch point.
2. Move the database to a hosted libsql/Turso URL — same adapter, same schema.

With both done there is no volume, and replicas become possible.

### The first admin account is a race

Payload shows a "create first user" screen to whoever reaches `/admin` while the
users table is empty — there is no invite step. On a fresh production database that
is open to anyone who finds the URL first. Create the account as part of the deploy
(the seed script does it from `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`), or at least
before the URL is shared.

### Preview/PR deploys get their own database, never the real one

Railway's PR environments copy _configuration_, not data, so a preview comes up with
an empty volume: no content, no admin user. There is an opt-in "Copy Volume Data"
setting that clones the base environment's volume into the PR environment — note
that is a **copy**, not a shared database. Pointing a second deployment at the live
SQLite file is not possible at all: a volume attaches to exactly one service, and two
machines cannot share a file.

This is the one place the SQLite choice is genuinely more restrictive than a network
database, where a preview is just a different connection string. Two mitigations:

- `pnpm seed` fills an empty preview with realistic bilingual content in seconds.
  For reviewing a UI change that is usually better than production data anyway,
  since a preview writing to real content is not something you want.
- A hosted libsql/Turso database supports branching, which gives real
  point-in-time copies per preview if that is ever needed.

### Volume size caps count uploads

Railway's volume cap is per plan (Hobby 5GB at time of writing) and `public/media`
shares it with the database. A photo-heavy charity site can approach that faster
than expected, which is the practical argument for doing the R2 move early rather
than as an optimization.

### Cloudflare in front

Railway has no CDN of its own, so this is the way to get one.

- SSL mode must be **Full (strict)** when proxying Railway, or you can get redirect
  loops.
- Cache Rules keyed on file extension will match `/api/media/file/x.jpg` but **not**
  `/_next/image?…`, which has no extension. Rules must target it explicitly.
- `force-dynamic` emits no cache headers, so HTML is not cached at the edge. That is
  the desired behaviour: editors expect a publish to show up immediately. Cache
  media aggressively, not pages.

## Upgrading Payload

`payload` and every `@payloadcms/*` package must sit on the **exact same version** —
Payload checks this at startup (`checkPayloadDependencies.js`) and refuses to boot on
a mismatch, so they move as one unit:

```bash
pnpm up payload '@payloadcms/*' --latest
pnpm generate:types        # rewrites src/payload-types.ts — commit it
pnpm generate:importmap    # rewrites the admin import map
```

Then restart `pnpm dev` (the config is read once at start) and re-run `pnpm build`.
If the upgrade changed the schema, add a migration with `pnpm payload migrate:create`
before deploying — development auto-push will hide the need for it locally.

Read the release notes for the range you skipped; minor bumps have no codemods.

## Conventions

- Read content with the **Local API** (`getPayloadClient()` from `src/lib/payload.ts`)
  directly in server components. No fetch wrappers, no HTTP round-trip.
- Run `pnpm generate:types` after any schema change and commit `src/payload-types.ts`.
- Upload fields come back as an id _or_ a full document. Go through the helpers in
  `src/lib/media.ts` rather than re-checking the shape at each call site.
- Slugs are **not** localized — one document keeps one URL in both languages, which
  is what lets the language switcher swap only the first path segment.
- **Don't compose Ukrainian UI strings from fragments.** Ukrainian inflects, so
  "Назад до" + "Проєкти" produces the wrong case. Write each full phrase as its own
  key in `src/lib/dictionary.ts` (see `backToProjects`).
- Import across directories with the `@/` alias (`@/lib/format`, `@/components/Card`),
  not long `../../../` chains. Siblings stay relative.
- Formatting is **Prettier's defaults** — there is deliberately no `.prettierrc`.
  Run `pnpm exec prettier --write .` (not `pnpx`, which downloads a different
  Prettier instead of the project's). `.prettierignore` covers the generated files
  that would otherwise churn on every regeneration.
- `/sitemap.xml` and `/robots.txt` come from `src/app/sitemap.ts` and
  `src/app/robots.ts`. Both must live at the **app root** — inside a route group
  `robots.ts` is silently shadowed by the `[locale]` segment and 404s.
- Keep UI chrome strings in `src/lib/dictionary.ts` and everything an editor might
  reword in Payload. There is deliberately no i18n library.

## Known limitations

- `public/logo.jpg` is a 150×150 Instagram avatar — fine for the 44px header mark,
  too small for a hero or favicon set. Replace it when a real asset arrives.
- Seeded content has no images; cards omit the image frame when there's no cover.
- SQLite + local disk uploads mean a persistent filesystem is required. Note this
  does _not_ imply Postgres if that changes: `@payloadcms/db-sqlite` talks libsql,
  so a hosted libsql/Turso URL in `DATABASE_URI` is a drop-in with the same schema.
  Uploads are the part that would actually have to move, to `@payloadcms/storage-s3`.
