import { ShieldCheck } from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { Wordmark } from '@/components/layout/crest'
import { Button } from '@/components/ui/button'
import { asset } from '@/lib/asset'
import { useAuth } from '@/lib/auth'

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  )
}

function MicrosoftGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  )
}

const ERRORS: Record<string, string> = {
  provider_not_configured: 'That sign-in option has not been set up yet. Try the other one, or ask the committee.',
  access_denied: 'Sign-in was cancelled. Choose an account to continue.',
  state_mismatch: 'Your sign-in took too long or was opened in another tab. Try again.',
  token_exchange_failed: 'We could not confirm your account with the provider. Try again in a moment.',
  invalid_token: 'We could not confirm your account with the provider. Try again in a moment.',
  invalid_request: 'Something went wrong during sign-in. Try again.',
  server_misconfigured: 'Sign-in is not set up correctly on the server. Let the committee know.',
}

export function SignInPage() {
  const { member, loading, previewMode, signIn, signInPreview } = useAuth()
  const [params] = useSearchParams()
  const error = params.get('error')
  if (!loading && member) return <Navigate to="/" replace />

  return (
    <div className="field-verde relative grid min-h-dvh overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <section className="relative z-10 flex flex-col justify-between px-6 py-8 md:px-14 md:py-12">
        <Wordmark />

        <div className="max-w-[440px] py-16">
          <h1 className="type-display text-[clamp(3rem,6vw,5.25rem)] text-ivory">Your keys, please.</h1>
          <p className="mt-6 max-w-[38ch] text-[17px] leading-relaxed text-smoke">
            Sign in to see your garage, the season&rsquo;s drives and what everyone else is bringing to the next meet.
          </p>

          {error && (
            <p role="alert" className="mt-8 rounded-[18px] border border-signal/40 bg-signal/10 px-4 py-3 text-sm text-ivory">
              {ERRORS[error] ?? ERRORS.invalid_request}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-3">
            <Button size="lg" variant="default" onClick={() => signIn('google')} className="justify-start pl-5">
              <GoogleGlyph />
              Continue with Google
            </Button>
            <Button size="lg" variant="outline" onClick={() => signIn('microsoft')} className="justify-start pl-5">
              <MicrosoftGlyph />
              Continue with Microsoft
            </Button>
            {previewMode && (
              <Button size="lg" variant="link" onClick={() => signInPreview()} className="justify-start px-0">
                Preview the dashboard without signing in
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-smoke">
          <span>Membership is by invitation.</span>
          <a href="/admin" className="inline-flex items-center gap-1.5 hover:text-ivory">
            <ShieldCheck className="size-4" strokeWidth={1.75} />
            Club admin sign-in
          </a>
        </div>
      </section>

      <section aria-hidden className="relative hidden lg:block">
        <img
          src={asset('renders/ferrari-458-italia.webp')}
          alt=""
          className="absolute inset-0 m-auto w-[88%] max-w-[900px] object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.7)]"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
        <div className="absolute inset-x-[10%] bottom-[22%] h-24 rounded-full bg-teal/15 blur-3xl" />
      </section>
    </div>
  )
}
