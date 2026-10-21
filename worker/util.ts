const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlToBytes(input: string): Uint8Array<ArrayBuffer> {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=')
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export function textToBase64Url(text: string): string {
  return bytesToBase64Url(encoder.encode(text))
}

export function base64UrlToText(input: string): string {
  return decoder.decode(base64UrlToBytes(input))
}

export function randomToken(byteLength = 32): string {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)))
}

export async function sha256Base64Url(input: string): Promise<string> {
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(input))))
}

/** Constant-time string comparison (no early exit on the first differing byte). */
export function safeEqual(a: string, b: string): boolean {
  const x = encoder.encode(a)
  const y = encoder.encode(b)
  let diff = x.length ^ y.length
  const len = Math.max(x.length, y.length)
  for (let i = 0; i < len; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}

function hmacKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [usage])
}

/** Produces "<base64url payload>.<base64url HMAC-SHA256>". */
export async function signValue(payload: unknown, secret: string): Promise<string> {
  const body = textToBase64Url(JSON.stringify(payload))
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret, 'sign'), encoder.encode(body))
  return `${body}.${bytesToBase64Url(new Uint8Array(sig))}`
}

/** Verifies the signature (constant-time, via Web Crypto) and returns the payload, or null. */
export async function verifyValue<T>(token: string, secret: string): Promise<T | null> {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  try {
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret, 'verify'),
      base64UrlToBytes(parts[1]),
      encoder.encode(parts[0]),
    )
    if (!ok) return null
    return JSON.parse(base64UrlToText(parts[0])) as T
  } catch {
    return null
  }
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie')
  if (!header) return null
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim()
  }
  return null
}

export function cookie(name: string, value: string, maxAgeSeconds: number, path = '/'): string {
  return `${name}=${value}; Path=${path}; Max-Age=${maxAgeSeconds}; HttpOnly; Secure; SameSite=Lax`
}

export function json(data: unknown, status = 200, headers?: HeadersInit): Response {
  const h = new Headers(headers)
  h.set('content-type', 'application/json')
  h.set('cache-control', 'no-store')
  return new Response(JSON.stringify(data), { status, headers: h })
}

export function redirect(location: string, cookies: string[] = []): Response {
  const h = new Headers({ location, 'cache-control': 'no-store' })
  for (const c of cookies) h.append('set-cookie', c)
  return new Response(null, { status: 302, headers: h })
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
