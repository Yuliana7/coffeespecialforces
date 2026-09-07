import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { generateSignedPutUrl } from '../../../../lib/storage/r2'
import { randomBytes } from 'crypto'

const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_BYTES || '10485760', 10) // 10 MB
const ALLOWED_TYPES = (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(',')

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { filename, contentType, size, entity, entityId, env = process.env.NEXT_PUBLIC_NODE_ENV || 'prod' } = body
  if (!filename || !contentType || !size || !entity || !entityId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
  }
  if (size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 })
  }

  const ext = filename.split('.').pop() ?? 'bin'
  const random = randomBytes(6).toString('hex')
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'')
  const key = `uploads/${env}/${entity}/${date}-${random}.${ext}`

  try {
    const expires = parseInt(process.env.UPLOAD_SIGNED_EXPIRES || '300', 10)
    const signedUrl = await generateSignedPutUrl(key, contentType, expires)
    const publicUrl = `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.CLOUDFLARE_R2_BUCKET}/${key}`
    return NextResponse.json({ signedUrl, key, publicUrl })
  } catch (err) {
    console.error('Error generating signed url', err)
    return NextResponse.json({ error: 'Could not generate signed url' }, { status: 500 })
  }
}
