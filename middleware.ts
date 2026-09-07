import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const url = req.nextUrl.clone()

  if (url.pathname.startsWith('/admin')) {
    if (!token) {
      url.pathname = '/api/auth/signin'
      return NextResponse.redirect(url)
    }
    // Optionally: check role in token
    const role = (token as any)?.role ?? (token as any)?.user?.role
    if (role && role !== 'admin' && role !== 'editor') {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
