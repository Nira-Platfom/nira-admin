import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page through
  if (pathname === '/login') return NextResponse.next()

  const adminKey = request.cookies.get('nira_admin_key')?.value

  // Only check that cookie exists — the backend validates the actual secret
  // on every API call and returns 403 if invalid (handled in lib/api.ts)
  if (!adminKey) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
}
