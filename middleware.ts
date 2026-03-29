import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page through
  if (pathname === '/login') return NextResponse.next()

  const adminKey = request.cookies.get('nira_admin_key')?.value
  const expectedSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'nira_admin_2025'

  if (!adminKey || adminKey !== expectedSecret) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
}
