import { NextResponse, type NextRequest } from 'next/server'

export function getCookieName(): string {
  return process.env.AUTH_COOKIE_NAME || 'app_auth'
}

export function getMaxAge(): number {
  const v = parseInt(process.env.AUTH_COOKIE_MAX_AGE || '604800', 10) // 7 days
  return Number.isFinite(v) && v > 0 ? v : 604800
}

export function getAuthSecret(): string {
  const s = process.env.AUTH_SECRET
  if (!s || s.length < 16) {
    throw new Error('AUTH_SECRET is missing or too short')
  }
  return s
}

export function issueAuthCookie(res: NextResponse, token: string): void {
  const name = getCookieName()
  const maxAge = getMaxAge()
  res.cookies.set(name, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  })
}

export function clearAuthCookie(res: NextResponse): void {
  const name = getCookieName()
  res.cookies.set(name, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

export function readAuthCookie(req: NextRequest): string | null {
  const name = getCookieName()
  return req.cookies.get(name)?.value || null
}

