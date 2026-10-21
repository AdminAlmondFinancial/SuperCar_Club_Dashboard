import type { Env, Member, MemberMeta, Provider, StoredMember } from './types'
import { countCars, putMember } from './members'
import {
  base64UrlToText,
  cookie,
  json,
  randomToken,
  readCookie,
  redirect,
  safeEqual,
  sha256Base64Url,
  signValue,
  verifyValue,
} from './util'

const SESSION_COOKIE = 'scc_session'
const OAUTH_COOKIE = 'scc_oauth'
const SESSION_SECONDS = 60 * 60 * 24 * 30
const OAUTH_SECONDS = 60 * 10

type SessionPayload = { sub: string; exp: number }
type OAuthPayload = { provider: Provider; state: string; verifier: string; nonce: string; exp: number }

type ProviderConfig = {
  clientId: string
  clientSecret: string
  authorizeUrl: string
  tokenUrl: string
}

function providerConfig(provider: Provider, env: Env): ProviderConfig | null {
  if (provider === 'google') {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null
    return {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
    }
  }
  if (!env.MICROSOFT_CLIENT_ID || !env.MICROSOFT_CLIENT_SECRET) return null
  const tenant = encodeURIComponent(env.MICROSOFT_TENANT || 'common')
  return {
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: env.MICROSOFT_CLIENT_SECRET,
    authorizeUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
  }
}

function appOrigin(request: Request, env: Env): string {
  return (env.APP_URL || new URL(request.url).origin).replace(/\/+$/, '')
}

function signInError(code: string, cookies: string[] = []): Response {
  return redirect(`/sign-in?error=${encodeURIComponent(code)}`, cookies)
}

const clearOAuthCookie = () => cookie(OAUTH_COOKIE, '', 0, '/api/auth')

export async function handleLogin(provider: Provider, request: Request, env: Env): Promise<Response> {
  const cfg = providerConfig(provider, env)
  if (!cfg) return signInError('provider_not_configured')
  if (!env.SESSION_SECRET) return signInError('server_misconfigured')

  const state = randomToken(24)
  const verifier = randomToken(48)
  const nonce = randomToken(16)
  const challenge = await sha256Base64Url(verifier)

  const url = new URL(cfg.authorizeUrl)
  url.search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: `${appOrigin(request, env)}/api/auth/${provider}/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    ...(provider === 'google' ? { prompt: 'select_account' } : { response_mode: 'query', prompt: 'select_account' }),
  }).toString()

  const payload: OAuthPayload = { provider, state, verifier, nonce, exp: Date.now() + OAUTH_SECONDS * 1000 }
  const signed = await signValue(payload, env.SESSION_SECRET)
  return redirect(url.toString(), [cookie(OAUTH_COOKIE, signed, OAUTH_SECONDS, '/api/auth')])
}

type IdClaims = {
  sub?: string
  iss?: string
  aud?: string | string[]
  exp?: number
  nonce?: string
  name?: string
  email?: string
  preferred_username?: string
  picture?: string
}

export async function handleCallback(provider: Provider, request: Request, env: Env): Promise<Response> {
  const cfg = providerConfig(provider, env)
  if (!cfg) return signInError('provider_not_configured', [clearOAuthCookie()])
  if (!env.SESSION_SECRET) return signInError('server_misconfigured', [clearOAuthCookie()])

  const url = new URL(request.url)
  if (url.searchParams.get('error')) return signInError('access_denied', [clearOAuthCookie()])

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const rawCookie = readCookie(request, OAUTH_COOKIE)
  if (!code || !state || !rawCookie) return signInError('invalid_request', [clearOAuthCookie()])

  const saved = await verifyValue<OAuthPayload>(rawCookie, env.SESSION_SECRET)
  if (!saved || saved.provider !== provider || saved.exp < Date.now() || !safeEqual(saved.state, state)) {
    return signInError('state_mismatch', [clearOAuthCookie()])
  }

  let claims: IdClaims
  try {
    const res = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: `${appOrigin(request, env)}/api/auth/${provider}/callback`,
        code_verifier: saved.verifier,
      }),
    })
    if (!res.ok) return signInError('token_exchange_failed', [clearOAuthCookie()])
    const body = (await res.json()) as { id_token?: string }
    if (!body.id_token) return signInError('invalid_token', [clearOAuthCookie()])
    // The ID token arrives directly from the provider's token endpoint over TLS, so the claims can be trusted
    // without checking its signature (OpenID Connect Core 3.1.3.7). We still check audience, expiry and nonce.
    const parts = body.id_token.split('.')
    if (parts.length !== 3) return signInError('invalid_token', [clearOAuthCookie()])
    claims = JSON.parse(base64UrlToText(parts[1])) as IdClaims
  } catch {
    return signInError('token_exchange_failed', [clearOAuthCookie()])
  }

  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
  const nonceOk = typeof claims.nonce === 'string' && safeEqual(claims.nonce, saved.nonce)
  if (!claims.sub || !aud.includes(cfg.clientId) || !nonceOk || (claims.exp ?? 0) * 1000 < Date.now()) {
    return signInError('invalid_token', [clearOAuthCookie()])
  }

  const email = claims.email || claims.preferred_username || ''
  const memberId = `${provider}:${claims.sub}`
  const key = `member:${memberId}`
  const now = new Date().toISOString()
  const { value: existing, metadata } = await env.CLUB_KV.getWithMetadata<StoredMember, MemberMeta>(key, 'json')
  const member: StoredMember = {
    ...existing,
    id: memberId,
    name: claims.name || existing?.name || email.split('@')[0] || 'Member',
    email: email || existing?.email || '',
    ...(claims.picture || existing?.avatarUrl ? { avatarUrl: claims.picture || existing?.avatarUrl } : {}),
    provider,
    memberSince: existing?.memberSince ?? now.slice(0, 10),
    lastSignIn: now,
  }
  const carCount = metadata?.carCount ?? (await countCars(env.CLUB_KV, memberId))
  await putMember(env.CLUB_KV, member, carCount)

  const session: SessionPayload = { sub: memberId, exp: Date.now() + SESSION_SECONDS * 1000 }
  const token = await signValue(session, env.SESSION_SECRET)
  return redirect('/', [cookie(SESSION_COOKIE, token, SESSION_SECONDS), clearOAuthCookie()])
}

/** Returns the signed-in member id, or null. */
export async function sessionMemberId(request: Request, env: Env): Promise<string | null> {
  if (!env.SESSION_SECRET) return null
  const raw = readCookie(request, SESSION_COOKIE)
  if (!raw) return null
  const payload = await verifyValue<SessionPayload>(raw, env.SESSION_SECRET)
  if (!payload || typeof payload.sub !== 'string' || payload.exp < Date.now()) return null
  return payload.sub
}

export async function handleMe(request: Request, env: Env): Promise<Response> {
  const id = await sessionMemberId(request, env)
  if (!id) return json({ member: null })
  const stored = await env.CLUB_KV.get<StoredMember>(`member:${id}`, 'json')
  if (!stored) return json({ member: null })
  const member: Member = {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    ...(stored.avatarUrl ? { avatarUrl: stored.avatarUrl } : {}),
    provider: stored.provider,
    memberSince: stored.memberSince,
    ...(stored.isAdmin ? { isAdmin: true } : {}),
  }
  return json({ member })
}

export function handleLogout(): Response {
  return json({ ok: true }, 200, { 'set-cookie': cookie(SESSION_COOKIE, '', 0) })
}
