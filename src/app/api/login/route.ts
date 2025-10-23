import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthSecret, issueAuthCookie, getMaxAge } from '@/lib/auth-cookie'
import { makeToken } from '@/lib/auth-node'
import crypto from 'node:crypto'

const loginBodySchema = z.object({
  password: z.string().min(1),
})

function constantTimeCompareSecret(input: string, secret: string): boolean {
  // Compare SHA-256 hashes to avoid length leak and keep constant-time
  const a = crypto.createHash('sha256').update(input).digest()
  const b = crypto.createHash('sha256').update(secret).digest()
  return crypto.timingSafeEqual(a, b)
}

export async function POST(req: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
    }

    const json = await req.json().catch(() => null)
    const parse = loginBodySchema.safeParse(json)
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { password } = parse.data
    const ok = constantTimeCompareSecret(password, adminPassword)
    if (!ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = getAuthSecret()
    const token = makeToken(secret, getMaxAge())
    const res = new NextResponse(null, { status: 204 })
    issueAuthCookie(res, token)
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
