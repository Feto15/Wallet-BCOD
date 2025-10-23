import { NextResponse, type NextRequest } from 'next/server'
import { readAuthCookie, getAuthSecret } from '@/lib/auth-cookie'
import { verifyToken } from '@/lib/auth-edge'

function isExcludedPath(pathname: string): boolean {
  // Public paths: login page, login/logout API, Next assets, favicon
  if (
    pathname === '/login' ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico' ||
    pathname === '/api/login' ||
    pathname === '/api/logout'
  ) {
    return true
  }
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isExcludedPath(pathname)) {
    return NextResponse.next()
  }

  const token = readAuthCookie(req)
  const isApi = pathname.startsWith('/api')

  try {
    const secret = getAuthSecret()
    if (!token) {
      return handleUnauthed(req, isApi)
    }
    const payload = await verifyToken(token, secret)
    if (!payload) {
      return handleUnauthed(req, isApi)
    }
    return NextResponse.next()
  } catch {
    // Misconfiguration (e.g., missing AUTH_SECRET) → treat as unauthorized
    return handleUnauthed(req, isApi)
  }
}

function handleUnauthed(req: NextRequest, isApi: boolean) {
  if (isApi) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('next', req.nextUrl.pathname + (req.nextUrl.search || ''))
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/login, api/logout (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/login|api/logout|_next/static|_next/image|favicon.ico).*)',
  ],
}
