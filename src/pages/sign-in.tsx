import { ShieldCheck } from 'lucide-react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { Wordmark } from '@/components/site/primitives'
import { asset } from '@/lib/asset'
import { useAuth } from '@/lib/auth'

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  )
}

function MicrosoftGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
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

const providerButton = 'flex h-13 w-full items-center gap-4 border px-5 text-[14px] font-medium transition-colors'

export function SignInPage() {
  const { member, loading, previewMode, signIn, signInPreview } = useAuth()
  const [params] = useSearchParams()
  const error = params.get('error')
  if (!loading && member) return <Navigate to="/" replace />

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-obsidian text-white">
      <img
        src={asset('images/editorial/amalfi-coast-1672.webp')}
        srcSet={`${asset('images/editorial/amalfi-coast-960.webp')} 960w, ${asset('images/editorial/amalfi-coast-1672.webp')} 1672w`}
        sizes="100vw"
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover object-[72%_50%]"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(8_8_9/0.92)_0%,rgb(8_8_9/0.7)_45%,rgb(8_8_9/0.2)_100%)] max-lg:bg-[linear-gradient(0deg,rgb(8_8_9/0.95)_30%,rgb(8_8_9/0.5)_100%)]" />

      <div className="page-gutter mx-auto flex min-h-dvh max-w-[1520px] flex-col py-8 lg:py-10">
        <Wordmark className="text-[17px] lg:text-[19px]" />

        <div className="my-auto max-w-[460px] py-16">
          <p className="eyebrow rise text-white/75">Members only</p>
          <h1 className="display rise mt-5 text-[clamp(3rem,6.4vw,5.6rem)] leading-[0.96] [animation-delay:80ms]">
            Your keys,
            <br />
            please.
          </h1>
          <p className="rise mt-6 max-w-[38ch] text-[16px] leading-relaxed text-white/80 [animation-delay:160ms]">
            Sign in to see your garage, the season&rsquo;s drives and what everyone else is bringing to the next meet.
          </p>

          {error && (
            <p role="alert" className="mt-8 border border-white/30 bg-black/40 px-4 py-3 text-[14px]">
              {ERRORS[error] ?? ERRORS.invalid_request}
            </p>
          )}

          <div className="rise mt-10 grid gap-3 [animation-delay:240ms]">
            <button type="button" onClick={() => signIn('google')} className={`${providerButton} border-white bg-white text-ink hover:bg-paper`}>
              <GoogleGlyph /> Continue with Google
            </button>
            <button type="button" onClick={() => signIn('microsoft')} className={`${providerButton} border-white/60 hover:bg-white hover:text-ink`}>
              <MicrosoftGlyph /> Continue with Microsoft
            </button>
            {previewMode && (
              <button type="button" onClick={() => signInPreview()} className="link-rule mt-3 justify-self-start text-[10.5px] text-white/90 hover:text-white">
                Preview the site without signing in
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-white/65">
          <span>Membership is by invitation.</span>
          <a href="/admin" className="inline-flex items-center gap-1.5 hover:text-white">
            <ShieldCheck className="size-4" strokeWidth={1.5} />
            Club admin sign-in
          </a>
          <span className="lg:ml-auto">Cover photograph is illustrative.</span>
        </div>
      </div>
    </div>
  )
}
