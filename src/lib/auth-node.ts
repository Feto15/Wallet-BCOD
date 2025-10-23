// HMAC-signed token utilities for Node runtime (API routes)
import crypto from 'node:crypto'

export type AuthPayload = {
  iat: number
  exp: number
  ver: 1
}

function b64urlEncode(buf: Buffer | Uint8Array): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
  return b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64')
}

function hmacSha256(message: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest('base64url')
}

export function signPayload(payload: string, secret: string): string {
  const sig = hmacSha256(payload, secret)
  return `${payload}.${sig}`
}

export function makeToken(secret: string, maxAgeSeconds: number): string {
  const now = Math.floor(Date.now() / 1000)
  const data: AuthPayload = { iat: now, exp: now + maxAgeSeconds, ver: 1 }
  const payload = b64urlEncode(Buffer.from(JSON.stringify(data), 'utf8'))
  return signPayload(payload, secret)
}

export function verifyToken(token: string, secret: string): AuthPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  const expected = hmacSha256(payload, secret)
  if (!constantTimeEqual(sig, expected)) return null
  try {
    const json = b64urlDecode(payload).toString('utf8')
    const data = JSON.parse(json) as AuthPayload
    if (!data || typeof data.exp !== 'number' || typeof data.iat !== 'number') return null
    const now = Math.floor(Date.now() / 1000)
    if (data.exp <= now) return null
    return data
  } catch {
    return null
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) {
    // Compare hashes to keep timing consistent even on length mismatch
    const ah = crypto.createHash('sha256').update(ab).digest()
    const bh = crypto.createHash('sha256').update(bb).digest()
    return crypto.timingSafeEqual(ah, bh) && false
  }
  return crypto.timingSafeEqual(ab, bb)
}

