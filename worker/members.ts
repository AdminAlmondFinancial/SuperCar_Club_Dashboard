import { readGarage } from './garage'
import type { MemberMeta, StoredMember } from './types'

const META_LIMIT_BYTES = 1000

const byteLength = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length

/** Everything the admin page shows, kept in KV list metadata (1 KB limit) so listing needs no per-member reads. */
export function memberMeta(member: StoredMember, carCount: number): MemberMeta {
  const meta: MemberMeta = {
    name: member.name,
    email: member.email,
    provider: member.provider,
    memberSince: member.memberSince,
    lastSignIn: member.lastSignIn,
    carCount,
  }
  while (byteLength(meta) > META_LIMIT_BYTES && meta.name.length > 1) meta.name = meta.name.slice(0, Math.floor(meta.name.length / 2))
  while (byteLength(meta) > META_LIMIT_BYTES && meta.email.length > 1) meta.email = meta.email.slice(0, Math.floor(meta.email.length / 2))
  return meta
}

export async function putMember(kv: KVNamespace, member: StoredMember, carCount: number): Promise<void> {
  await kv.put(`member:${member.id}`, JSON.stringify(member), { metadata: memberMeta(member, carCount) })
}

/** Refreshes the stored car count after a garage write. A member who has not signed in has no record to update. */
export async function setCarCount(kv: KVNamespace, memberId: string, carCount: number): Promise<void> {
  const member = await kv.get<StoredMember>(`member:${memberId}`, 'json')
  if (member) await putMember(kv, member, carCount)
}

/** Car count for a member whose record predates list metadata. */
export async function countCars(kv: KVNamespace, memberId: string): Promise<number> {
  return (await readGarage(kv, memberId)).length
}
