import { Crest } from '@/components/layout/crest'

/** Shown while a page's code or the member's session loads. */
export function PageLoading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <Crest className="h-12 w-11 animate-pulse motion-reduce:animate-none" />
        <span className="text-caption text-smoke">{label}</span>
      </div>
    </div>
  )
}
