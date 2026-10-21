import { verifyAccess } from './access'
import type { Env, StoredMember } from './types'
import { readGarage } from './garage'
import { escapeHtml } from './util'

const MAX_MEMBERS = 1000

type Row = { member: StoredMember; cars: number }

async function loadRows(kv: KVNamespace): Promise<{ rows: Row[]; truncated: boolean }> {
  const keys: string[] = []
  let cursor: string | undefined
  let truncated = false
  do {
    const page = await kv.list({ prefix: 'member:', cursor })
    for (const k of page.keys) keys.push(k.name)
    cursor = page.list_complete ? undefined : page.cursor
    if (keys.length >= MAX_MEMBERS) {
      truncated = !page.list_complete || keys.length > MAX_MEMBERS
      break
    }
  } while (cursor)

  const rows: Row[] = []
  for (let i = 0; i < Math.min(keys.length, MAX_MEMBERS); i += 25) {
    const batch = await Promise.all(
      keys.slice(i, i + 25).map(async (key) => {
        const member = await kv.get<StoredMember>(key, 'json')
        if (!member) return null
        return { member, cars: (await readGarage(kv, member.id)).length }
      }),
    )
    for (const r of batch) if (r) rows.push(r)
  }
  rows.sort((a, b) => (b.member.lastSignIn || '').localeCompare(a.member.lastSignIn || ''))
  return { rows, truncated }
}

const fmtDate = (iso?: string) => (iso ? escapeHtml(iso.slice(0, 10)) : '')

function page(adminEmail: string, rows: Row[], truncated: boolean): string {
  const totalCars = rows.reduce((n, r) => n + r.cars, 0)
  const body = rows.length
    ? rows
        .map(
          ({ member: m, cars }) => `
        <tr>
          <td><span class="name">${escapeHtml(m.name)}</span><span class="mail">${escapeHtml(m.email)}</span></td>
          <td>${m.provider === 'google' ? 'Google' : 'Microsoft'}</td>
          <td class="num">${fmtDate(m.memberSince)}</td>
          <td class="num">${fmtDate(m.lastSignIn)}</td>
          <td class="num cars">${cars}</td>
        </tr>`,
        )
        .join('')
    : `<tr><td colspan="5" class="empty">No members have signed in yet.</td></tr>`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Members | SuperCar Club</title>
<style>
  :root { --ink:#000; --verde:#0c2620; --verde-deep:#071713; --champagne:#cdb98f; --ivory:#eeeae2; --smoke:#a6a59f; --line:rgba(205,185,143,.18); }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; color:var(--ivory); background:var(--ink) radial-gradient(120% 70% at 20% 0%, var(--verde) 0%, var(--verde-deep) 45%, var(--ink) 100%) no-repeat; font-family: "Archivo", system-ui, -apple-system, "Segoe UI", sans-serif; line-height:1.5; }
  main { max-width:960px; margin:0 auto; padding:56px 20px 96px; }
  h1 { font-family:"Bodoni Moda", "Didot", Georgia, serif; font-weight:500; font-size:clamp(2rem,5vw,3rem); margin:0 0 8px; letter-spacing:-.01em; }
  .sub { color:var(--smoke); margin:0 0 32px; }
  .tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:24px; }
  .tile { border:1px solid var(--line); border-radius:18px; padding:16px 18px; background:rgba(0,0,0,.35); }
  .tile b { display:block; font-size:2rem; font-weight:500; font-variant-numeric:tabular-nums; }
  .tile span { color:var(--smoke); font-size:.9rem; }
  .panel { border:1px solid var(--line); border-radius:28px; background:rgba(0,0,0,.4); overflow:hidden; }
  .scroll { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; min-width:560px; }
  th { text-align:left; font-weight:500; color:var(--champagne); font-size:.9rem; padding:18px 20px 12px; border-bottom:1px solid var(--line); }
  td { padding:14px 20px; border-bottom:1px solid var(--line); vertical-align:middle; }
  tr:last-child td { border-bottom:0; }
  .name { display:block; }
  .mail { display:block; color:var(--smoke); font-size:.88rem; word-break:break-all; }
  .num { font-variant-numeric:tabular-nums; white-space:nowrap; }
  .cars { text-align:right; }
  th:last-child { text-align:right; }
  .empty { text-align:center; color:var(--smoke); padding:40px 20px; }
  .note { color:var(--smoke); font-size:.9rem; margin-top:16px; }
</style>
</head>
<body>
<main>
  <h1>Members</h1>
  <p class="sub">Signed in to Cloudflare Access as ${escapeHtml(adminEmail || 'an administrator')}.</p>
  <section class="tiles" aria-label="Summary">
    <div class="tile"><b>${rows.length}</b><span>Members</span></div>
    <div class="tile"><b>${totalCars}</b><span>Cars in garages</span></div>
  </section>
  <div class="panel"><div class="scroll">
    <table>
      <thead><tr><th scope="col">Member</th><th scope="col">Signs in with</th><th scope="col">Joined</th><th scope="col">Last visit</th><th scope="col">Cars</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  </div></div>
  ${truncated ? `<p class="note">Showing the first ${MAX_MEMBERS} members.</p>` : ''}
</main>
</body>
</html>`
}

export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const claims = await verifyAccess(request, env)
  if (!claims) {
    return new Response('Forbidden', { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } })
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } })
  }
  const { rows, truncated } = await loadRows(env.CLUB_KV)
  return new Response(request.method === 'HEAD' ? null : page(claims.email ?? '', rows, truncated), {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    },
  })
}
