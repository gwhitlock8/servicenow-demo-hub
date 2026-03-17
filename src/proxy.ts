import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const isLoggedIn = !!token
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isApiAdminRoute = req.nextUrl.pathname.startsWith('/api/users')

  if ((isAdminRoute || isApiAdminRoute) && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/users/:path*'],
}
