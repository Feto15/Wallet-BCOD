import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth-cookie'

export async function POST() {
  const res = new NextResponse(null, { status: 204 })
  clearAuthCookie(res)
  return res
}
