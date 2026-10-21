export interface Env {
  ASSETS: Fetcher
  CLUB_KV: KVNamespace
  APP_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  MICROSOFT_CLIENT_ID?: string
  MICROSOFT_CLIENT_SECRET?: string
  MICROSOFT_TENANT?: string
  SESSION_SECRET?: string
  ACCESS_TEAM_DOMAIN?: string
  ACCESS_AUD?: string
}

export type Provider = 'google' | 'microsoft'

/** Mirrors the Member type in src/lib/auth.tsx. */
export type Member = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  provider: Provider
  memberSince: string
  isAdmin?: boolean
}

/** What we store in KV: the public member plus bookkeeping. */
export type StoredMember = Member & { lastSignIn: string }

/** Mirrors GarageEntry in src/lib/garage.tsx. */
export type GarageEntry = {
  carId: string
  colour: string
  acquired: string
  lastService: string
  mileageKm: number
}
