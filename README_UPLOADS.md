## Cloudflare R2 uploads

This scaffold implements a signed direct-to-Cloudflare R2 upload flow.

How it works
- Admin requests a signed PUT URL from `/api/uploads/signed-url` with filename, contentType, size, entity and entityId.
- Server validates the request (auth, allowed file types, size) and returns a short-lived signed URL and a public URL.
- Admin client PUTs the file directly to the signed URL.
- Client then calls `/api/uploads/complete` to let the server attach the public URL to the DB record (project/event).

Environment
Add the following env variables (already present in `.env.example`):

- CLOUDFLARE_R2_ACCOUNT_ID
- CLOUDFLARE_R2_ACCESS_KEY_ID
- CLOUDFLARE_R2_SECRET_ACCESS_KEY
- CLOUDFLARE_R2_BUCKET

Notes on serving images
- This scaffold stores originals in R2 and recommends using Cloudflare Image Resizing at render-time, e.g.:

```
https://<your-cdn-domain>/cdn-cgi/image/width=800,format=auto/uploads/prod/projects/20260907-8f3a2c7b.png
```

This allows producing optimized variants without generating thumbnails on upload.

CORS and bucket settings
- Ensure your R2 bucket allows PUT from signed URLs and that your account/bucket settings are configured for access as documented by Cloudflare.

