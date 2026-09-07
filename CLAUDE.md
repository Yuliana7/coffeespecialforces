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
routes render which documents. Payload's *website template* wires it up by hand, in
`templates/website/src/collections/Pages/hooks/revalidatePage.ts`, calling
`revalidatePath` from an `afterChange` hook — that is the pattern to copy if caching
is ever wanted here.

Our pages await only `params` and Local API queries — no dynamic APIs — so without
the export Next considers them fully static. Confirm which way a build went by
reading `.next/prerender-manifest.json`: it should list only `/_not-found` and
`/_global-error`.

Next 16's `cacheComponents: true` would flip the default (uncached IO becomes
dynamic, making the export unnecessary), but invalidation would *still* be manual
via `revalidateTag`. It is not enabled in Payload's 3.88 template; leave it off.

### Writing a second locale duplicates array rows unless you pass row ids

Array fields (`stats`, `methods`, `reports`, …) are shared between locales — only the
fields *inside* them are translated. Writing the English pass without each row's `id`
appends a second set of rows instead of translating the existing ones. `src/seed.ts`
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
knowing *before* picking a host, because they are awkward to undo later.

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

### Preview/PR deploys get their own database, never the real one

Railway's PR environments copy *configuration*, not data, so a preview comes up with
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

## Conventions

- Read content with the **Local API** (`getPayloadClient()` from `src/lib/payload.ts`)
  directly in server components. No fetch wrappers, no HTTP round-trip.
- Run `pnpm generate:types` after any schema change and commit `src/payload-types.ts`.
- Upload fields come back as an id *or* a full document. Go through the helpers in
  `src/lib/media.ts` rather than re-checking the shape at each call site.
- Slugs are **not** localized — one document keeps one URL in both languages, which
  is what lets the language switcher swap only the first path segment.
- **Don't compose Ukrainian UI strings from fragments.** Ukrainian inflects, so
  "Назад до" + "Проєкти" produces the wrong case. Write each full phrase as its own
  key in `src/lib/dictionary.ts` (see `backToProjects`).
- Keep UI chrome strings in `src/lib/dictionary.ts` and everything an editor might
  reword in Payload. There is deliberately no i18n library.

## Known limitations

- `public/logo.jpg` is a 150×150 Instagram avatar — fine for the 44px header mark,
  too small for a hero or favicon set. Replace it when a real asset arrives.
- Seeded content has no images; cards omit the image frame when there's no cover.
- SQLite + local disk uploads mean a persistent filesystem is required. Note this
  does *not* imply Postgres if that changes: `@payloadcms/db-sqlite` talks libsql,
  so a hosted libsql/Turso URL in `DATABASE_URI` is a drop-in with the same schema.
  Uploads are the part that would actually have to move, to `@payloadcms/storage-s3`.
