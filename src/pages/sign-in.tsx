import { Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { Crest, Wordmark } from '@/components/layout/crest'
import { Button } from '@/components/ui/button'
import { asset } from '@/lib/asset'
import { useAuth, type Provider } from '@/lib/auth'

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
  // The provider page takes a moment to open, so the chosen button says so and both are held.
  const [pending, setPending] = useState<Provider | null>(null)
  // Coming back from the provider with the browser's back button restores this page as it was left.
  useEffect(() => {
    const reset = () => setPending(null)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])
  if (!loading && member) return <Navigate to="/" replace />

  const go = (provider: Provider) => {
    setPending(provider)
    signIn(provider)
  }

  return (
    <div className="field-verde relative grid min-h-dvh overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* The crest as a faint watermark, so the dark field is not empty on phones */}
      <Crest className="pointer-events-none absolute -right-24 bottom-[-6rem] h-[30rem] w-[27rem] opacity-[0.05] lg:hidden" />
      <section className="relative z-10 flex flex-col justify-between px-6 py-8 md:px-14 md:py-12">
        <Wordmark />

        <div className="enter max-w-[440px] py-16">
          <p className="eyebrow">Members only</p>
          <h1 className="type-display mt-4 text-[clamp(3rem,6vw,5.25rem)] text-ivory">Your keys, please.</h1>
          <p className="mt-5 max-w-[38ch] text-lead leading-relaxed text-smoke">
            Sign in to see your garage, the season&rsquo;s drives and what everyone else is bringing to the next meet.
          </p>

          {error && (
            <p role="alert" className="mt-8 rounded-[18px] border border-signal/40 bg-signal/10 px-4 py-3 text-label text-ivory">
              {ERRORS[error] ?? ERRORS.invalid_request}
            </p>
          )}

          <div className="mt-10 flex flex-col gap-3">
            <Button size="lg" variant="default" onClick={() => go('google')} disabled={!!pending} aria-busy={pending === 'google'} className="justify-start pl-5">
              {pending === 'google' ? <Loader2 className="animate-spin" /> : <GoogleGlyph />}
              {pending === 'google' ? 'Opening Google' : 'Continue with Google'}
            </Button>
            <Button size="lg" variant="outline" onClick={() => go('microsoft')} disabled={!!pending} aria-busy={pending === 'microsoft'} className="justify-start pl-5">
              {pending === 'microsoft' ? <Loader2 className="animate-spin" /> : <MicrosoftGlyph />}
              {pending === 'microsoft' ? 'Opening Microsoft' : 'Continue with Microsoft'}
            </Button>
          </div>

          {previewMode && (
            <div className="mt-8 border-t border-line pt-6">
              <button
                type="button"
                onClick={() => signInPreview()}
                className="text-label font-medium text-teal-bright underline-offset-4 hover:underline"
              >
                Look around with sample data
              </button>
              <p className="mt-1.5 text-caption text-smoke">A demo of the dashboard. The members, events and cars are examples, and nothing is sent to the club.</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-caption text-smoke">
          <span>Membership is by invitation.</span>
          <a href="/admin" className="inline-flex min-h-10 items-center gap-1.5 hover:text-ivory">
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
