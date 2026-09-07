# Coffee Special Forces — Auth (Google SSO)

This branch implements Google SSO using NextAuth and enforces an allowlist in the database to restrict admin access.

Setup steps (local):
1. Add the following env variables to .env:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_URL (e.g. http://localhost:3000)
   - NEXTAUTH_SECRET (strong random value)
2. Generate Prisma client: npx prisma generate
3. Run migrations (if you want) or prisma db push to update schema: npx prisma db push
4. Seed the DB (if needed): npx ts-node prisma/seed.ts

How allowlist works:
- Only users that already exist in the `User` table (created via seed or invite flow) will be allowed to sign in via Google SSO. This prevents arbitrary Google accounts from gaining access.

Next steps:
- Implement invite flow to add new admin emails to the DB.
- Consider adding 2FA or stricter session rules for sensitive actions.
