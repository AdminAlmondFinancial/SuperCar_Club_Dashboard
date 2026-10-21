import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Provider = 'google' | 'microsoft'

export type Member = {
  id: string
  name: string
  email: string
  avatarUrl?: string
  provider: Provider | 'preview'
  memberSince: string
  isAdmin?: boolean
}

type AuthState = {
  member: Member | null
  loading: boolean
  /** True when the Worker API is not reachable (local preview or static download). */
  previewMode: boolean
  signIn: (provider: Provider) => void
  signInPreview: (name?: string) => void
  signOut: () => Promise<void>
}

const PREVIEW_KEY = 'scc.preview-member'
const AuthContext = createContext<AuthState | null>(null)

function readPreviewMember(): Member | null {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY)
    return raw ? (JSON.parse(raw) as Member) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/me', { credentials: 'include' })
      .then(async (res) => {
        if (cancelled) return
        const isJson = res.headers.get('content-type')?.includes('application/json')
        if (!isJson) {
          // No Worker behind us: fall back to a local preview session.
          setPreviewMode(true)
          setMember(readPreviewMember())
          return
        }
        setMember(res.ok ? ((await res.json()) as { member: Member | null }).member : null)
      })
      .catch(() => {
        if (cancelled) return
        setPreviewMode(true)
        setMember(readPreviewMember())
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback((provider: Provider) => {
    window.location.href = `/api/auth/${provider}/login`
  }, [])

  const signInPreview = useCallback((name = 'Mannie Warriner') => {
    const m: Member = {
      id: 'preview',
      name,
      email: 'preview@supercar.club',
      provider: 'preview',
      memberSince: '2024-03-01',
    }
    try {
      localStorage.setItem(PREVIEW_KEY, JSON.stringify(m))
    } catch {
      /* storage unavailable: session lasts until reload */
    }
    setMember(m)
  }, [])

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(PREVIEW_KEY)
    } catch {
      /* ignore */
    }
    if (!previewMode) await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    setMember(null)
  }, [previewMode])

  const value = useMemo(
    () => ({ member, loading, previewMode, signIn, signInPreview, signOut }),
    [member, loading, previewMode, signIn, signInPreview, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
