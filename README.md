# Coffee Special Forces — Scaffold

This scaffold adds a minimal Next.js + TypeScript app with Tailwind and Prisma (SQLite) to bootstrap the Coffee Special Forces website.

Included:
- Next.js (App Router) + TypeScript
- Tailwind CSS configuration
- Prisma schema + seed (SQLite)
- Basic pages: home, work-areas, foundation, locations, admin stub
- i18n: en, uk
- Cloudflare R2 placeholders in .env.example
- A script to download the provided logo into public/assets/logo.jpg
- Assistant memory file at .assistant_memory.md for context persistence

Getting started (local):
1. Copy .env.example to .env and set values (DATABASE_URL defaults to SQLite dev.db)
2. Install deps: npm install
3. Generate Prisma client: npx prisma generate
4. Run seed: npx ts-node prisma/seed.ts
5. Run dev server: npm run dev

Images: this scaffold is configured to use Cloudflare R2 as the default storage provider. See the README section on Cloudflare R2 for setup notes.

