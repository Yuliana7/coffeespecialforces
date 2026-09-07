import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ACCOUNT = process.env.CLOUDFLARE_R2_ACCOUNT_ID
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const R2_SECRET = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

if (!R2_ACCOUNT || !R2_BUCKET || !R2_ACCESS_KEY || !R2_SECRET) {
  console.warn('R2 env vars not set: CLOUDFLARE_R2_*')
}

const endpoint = `https://${R2_ACCOUNT}.r2.cloudflarestorage.com`

export const s3Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: R2_ACCESS_KEY || '',
    secretAccessKey: R2_SECRET || ''
  },
  forcePathStyle: false
})

export async function generateSignedPutUrl(key: string, contentType: string, expiresInSeconds = 300) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  })
  const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds })
  return url
}
