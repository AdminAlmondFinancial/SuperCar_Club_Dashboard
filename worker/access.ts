import type { Env } from './types'
import { base64UrlToBytes, base64UrlToText } from './util'

type Jwk = JsonWebKey & { kid?: string }
type Claims = { aud?: string | string[]; iss?: string; exp?: number; nbf?: number; email?: string }

const JWKS_TTL_MS = 60 * 60 * 1000
const REFETCH_COOLDOWN_MS = 60 * 1000
let cache: { team: string; keys: Jwk[]; fetchedAt: number } | null = null

function normaliseTeam(raw: string): string {
  return raw.trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

async function loadKeys(team: string, force: boolean): Promise<Jwk[]> {
  const now = Date.now()
  if (cache && cache.team === team) {
    const age = now - cache.fetchedAt
    if (!force && age < JWKS_TTL_MS) return cache.keys
    if (force && age < REFETCH_COOLDOWN_MS) return cache.keys
  }
  const res = await fetch(`https://${team}/cdn-cgi/access/certs`)
  if (!res.ok) throw new Error('certs_unavailable')
  const body = (await res.json()) as { keys?: Jwk[] }
  cache = { team, keys: body.keys ?? [], fetchedAt: now }
  return cache.keys
}

/** Verifies the Cloudflare Access JWT. Returns the claims on success, or null on any failure. */
export async function verifyAccess(request: Request, env: Env): Promise<Claims | null> {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return null
  const token = request.headers.get('cf-access-jwt-assertion')
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    const header = JSON.parse(base64UrlToText(parts[0])) as { alg?: string; kid?: string }
    if (header.alg !== 'RS256' || !header.kid) return null
    const team = normaliseTeam(env.ACCESS_TEAM_DOMAIN)

    let jwk = (await loadKeys(team, false)).find((k) => k.kid === header.kid)
    if (!jwk) jwk = (await loadKeys(team, true)).find((k) => k.kid === header.kid)
    if (!jwk) return null

    const key = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    const ok = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      base64UrlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    )
    if (!ok) return null

    const claims = JSON.parse(base64UrlToText(parts[1])) as Claims
    const nowSec = Date.now() / 1000
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
    if (!aud.includes(env.ACCESS_AUD)) return null
    if (claims.iss !== `https://${team}`) return null
    if (typeof claims.exp !== 'number' || claims.exp < nowSec) return null
    if (typeof claims.nbf === 'number' && claims.nbf > nowSec + 30) return null
    return claims
  } catch {
    return null
  }
}
