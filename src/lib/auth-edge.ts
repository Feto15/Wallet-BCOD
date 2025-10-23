// Lightweight HMAC-signed token utilities for Edge runtime (middleware)
// Token format: base64url(JSON({ iat, exp, ver })) + '.' + base64url(HMAC_SHA256(payload, AUTH_SECRET))

export type AuthPayload = {
  iat: number
  exp: number
  ver: 1
}

const textEncoder = new TextEncoder()

function b64urlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let str = ''
  for (let i = 0; i < b.length; i++) str += String.fromCharCode(b[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, textEncoder.encode(message))
  return b64urlEncode(sig)
}

export async function signPayload(payload: string, secret: string): Promise<string> {
  const sig = await hmacSha256(payload, secret)
  return `${payload}.${sig}`
}

export async function makeToken(secret: string, maxAgeSeconds: number): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const data: AuthPayload = { iat: now, exp: now + maxAgeSeconds, ver: 1 }
  const payload = b64urlEncode(textEncoder.encode(JSON.stringify(data)))
  return signPayload(payload, secret)
}

export async function verifyToken(token: string, secret: string): Promise<AuthPayload | null> {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts
  const expected = await hmacSha256(payload, secret)
  if (sig !== expected) return null
  try {
    const json = new TextDecoder().decode(b64urlDecode(payload))
    const data = JSON.parse(json) as AuthPayload
    if (!data || typeof data.exp !== 'number' || typeof data.iat !== 'number') return null
    const now = Math.floor(Date.now() / 1000)
    if (data.exp <= now) return null
    return data
  } catch {
    return null
  }
}

