# Payload CMS — quick start

This folder contains a minimal Payload CMS app intended as the primary CMS for the project.

Setup (local / staging)
1. Create a MongoDB Atlas free-tier cluster and get the connection string.
2. Copy `.env.example` to `.env` and provide values for:
   - MONGODB_URI
   - PAYLOAD_SECRET
   - PAYLOAD_SERVER_URL (optional)
   - CLOUDFLARE_R2_ACCOUNT_ID (for upload provider, optional)
   - CLOUDFLARE_R2_BUCKET
   - CLOUDFLARE_R2_ACCESS_KEY_ID
   - CLOUDFLARE_R2_SECRET_ACCESS_KEY
3. Install dependencies:
   cd cms
   npm install
4. Start in dev mode:
   npm run dev

Admin UI
- The Payload admin will be available at http://localhost:3001/admin
- Create the first admin user through the CLI prompt or via the API (see Payload docs)

Cloudflare R2 upload provider
- This scaffold stores image URLs as simple text fields (images[].url).
- To integrate direct uploads and the media library with R2, configure an S3-compatible upload provider in Payload or implement a custom storage adapter. Example provider config is included below as guidance; you can adapt a community S3 storage adapter or implement a custom provider.

Notes about migration
- You asked to switch to Payload as the primary CMS and not re-upload files. Because Payload will become the canonical source of content, we will create content directly in Payload. If you want me to import existing records, I can add a migration script that reads your current DB and posts content to the Payload API.

