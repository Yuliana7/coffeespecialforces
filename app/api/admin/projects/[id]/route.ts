import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../../../lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id, 10)
  const project = await prisma.project.findUnique({ where: { id }, include: { translations: true } })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ project })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id, 10)
  const body = await req.json()
  const { slug, status, startDate, endDate, locationId, translations = [], images = [] } = body

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        slug,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        locationId: locationId ? parseInt(locationId, 10) : null,
        images
      }
    })

    // Upsert translations
    for (const t of translations) {
      const existing = await prisma.projectTranslation.findFirst({ where: { projectId: id, locale: t.locale } })
      if (existing) {
        await prisma.projectTranslation.update({ where: { id: existing.id }, data: { title: t.title, summary: t.summary, content: t.content } })
      } else {
        await prisma.projectTranslation.create({ data: { projectId: id, locale: t.locale, title: t.title, summary: t.summary, content: t.content } })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Could not update project' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id, 10)
  try {
    // Soft delete: set status to archived
    await prisma.project.update({ where: { id }, data: { status: 'archived' } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Could not delete project' }, { status: 500 })
  }
}
