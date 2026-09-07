import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../../../lib/db'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Simple list with pagination params
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const perPage = parseInt(url.searchParams.get('perPage') || '20', 10)

  const projects = await prisma.project.findMany({
    orderBy: { id: 'desc' },
    skip: (page - 1) * perPage,
    take: perPage
  })
  return NextResponse.json({ items: projects })
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { slug, status = 'draft', startDate, endDate, locationId, translations = [], images = [] } = body

  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  try {
    const project = await prisma.project.create({
      data: {
        slug,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        locationId: locationId ? parseInt(locationId, 10) : null,
        images,
        translations: {
          create: translations.map((t: any) => ({ locale: t.locale, title: t.title, summary: t.summary, content: t.content }))
        }
      },
      include: { translations: true }
    })
    return NextResponse.json({ project })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Could not create project' }, { status: 500 })
  }
}
