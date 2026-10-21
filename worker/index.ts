import { handleAdmin } from './admin'
import { handleCallback, handleLogin, handleLogout, handleMe, sessionMemberId } from './auth'
import { readGarage, validateGarage, writeGarage } from './garage'
import { setCarCount } from './members'
import type { Env, Provider } from './types'
import { json } from './util'

const MAX_BODY_BYTES = 8 * 1024

/** State-changing requests must come from this site (cookies are SameSite=Lax as well). */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  return !origin || origin === new URL(request.url).origin
}

async function handleGarage(request: Request, env: Env): Promise<Response> {
  const id = await sessionMemberId(request, env)
  if (!id) return json({ error: 'unauthorised' }, 401)

  if (request.method === 'GET') return json({ entries: await readGarage(env.CLUB_KV, id) })

  if (request.method === 'PUT') {
    if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403)
    const text = await request.text()
    if (text.length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413)
    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      return json({ error: 'invalid_json' }, 400)
    }
    const entries = validateGarage((body as { entries?: unknown } | null)?.entries)
    if (!entries) return json({ error: 'invalid_garage' }, 400)
    await writeGarage(env.CLUB_KV, id, entries)
    await setCarCount(env.CLUB_KV, id, entries.length)
    return json({ entries })
  }
  return json({ error: 'method_not_allowed' }, 405, { allow: 'GET, PUT' })
}

async function handleApi(request: Request, env: Env, path: string): Promise<Response> {
  const method = request.method

  const auth = path.match(/^\/api\/auth\/(google|microsoft)\/(login|callback)$/)
  if (auth) {
    if (method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { allow: 'GET' })
    const provider = auth[1] as Provider
    return auth[2] === 'login' ? handleLogin(provider, request, env) : handleCallback(provider, request, env)
  }

  switch (path) {
    case '/api/auth/logout':
      if (method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { allow: 'POST' })
      if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403)
      return handleLogout()
    case '/api/me':
      if (method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { allow: 'GET' })
      return handleMe(request, env)
    case '/api/garage':
      return handleGarage(request, env)
    default:
      return json({ error: 'not_found' }, 404)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname.replace(/(.)\/+$/, '$1')
    try {
      if (path.startsWith('/api/')) return await handleApi(request, env, path)
      if (path === '/admin' || path.startsWith('/admin/')) return await handleAdmin(request, env)
    } catch {
      // Never echo internals (or anything that might contain a secret) to the client.
      return json({ error: 'server_error' }, 500)
    }
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
