import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '../../../../../lib/db'

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { entity, entityId, url, key } = body
  if (!entity || !entityId || !url || !key) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  try {
    if (entity === 'project') {
      const id = parseInt(entityId, 10)
      const project = await prisma.project.findUnique({ where: { id } })
      if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      const images = project.images || []
      images.push(url)
      await prisma.project.update({ where: { id }, data: { images } })
      return NextResponse.json({ ok: true })
    }
    if (entity === 'event') {
      const id = parseInt(entityId, 10)
      const ev = await prisma.event.findUnique({ where: { id } })
      if (!ev) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      const images = ev.images || []
      images.push(url)
      await prisma.event.update({ where: { id }, data: { images } })
      return NextResponse.json({ ok: true })
    }
    if (entity === 'location') {
      const id = parseInt(entityId, 10)
      const loc = await prisma.location.findUnique({ where: { id } })
      if (!loc) return NextResponse.json({ error: 'Location not found' }, { status: 404 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Entity not supported' }, { status: 400 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
