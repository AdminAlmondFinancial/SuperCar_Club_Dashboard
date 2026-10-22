import { Box, ExternalLink, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { Car } from '@/data/cars'
import { authorUrl, carImage, embedUrl, modelPageUrl, sketchfab, type SketchfabModel } from '@/data/showroom'
import { cn } from '@/lib/utils'

/**
 * Some hosts (such as a sandboxed preview) cannot show another site in a frame. A build with
 * VITE_SKETCHFAB_MODE=link opens the model on Sketchfab in a new tab instead of loading it inline.
 */
const LINK_ONLY = import.meta.env.VITE_SKETCHFAB_MODE === 'link'

export function SketchfabCredit({ model, tone = 'dark', className }: { model: SketchfabModel; tone?: 'light' | 'dark'; className?: string }) {
  const link = cn('underline decoration-1 underline-offset-[3px]', tone === 'dark' ? 'hover:text-white' : 'hover:text-ink')
  return (
    <p className={cn('text-[12px] leading-relaxed', tone === 'dark' ? 'text-fog' : 'text-stone', className)}>
      3D model and studio still:{' '}
      <a href={modelPageUrl(model)} target="_blank" rel="noreferrer" className={link}>
        &ldquo;{model.title}&rdquo;
      </a>{' '}
      by{' '}
      <a href={authorUrl(model)} target="_blank" rel="noreferrer" className={link}>
        {model.author}
      </a>{' '}
      on Sketchfab,{' '}
      {model.licenseUrl ? (
        <a href={model.licenseUrl} target="_blank" rel="noreferrer" className={link}>
          {model.license}
        </a>
      ) : (
        model.license
      )}
      .
    </p>
  )
}

/**
 * The showroom stage: a large studio still with an "Explore in 3D" control. The hosted
 * Sketchfab viewer only loads when the member asks for it, which keeps the page light and
 * means no third-party frame runs until then.
 */
export function SketchfabStage({ car, className }: { car: Car; className?: string }) {
  const model = sketchfab[car.id]
  const img = carImage(car.id, 'dark')
  const [state, setState] = useState<'idle' | 'loading' | 'ready'>('idle')

  // A new car resets the stage.
  useEffect(() => setState('idle'), [car.id])

  const active = state !== 'idle'

  return (
    <div className={cn('relative overflow-hidden bg-obsidian', className)}>
      <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes="(min-width: 1520px) 1440px, 100vw"
          alt={`${car.make} ${car.model}, studio view`}
          className={cn('absolute inset-0 size-full object-cover transition-opacity duration-700', active && 'opacity-0')}
        />
        {active && model && (
          <iframe
            title={`${car.make} ${car.model} in 3D, by ${model.author} on Sketchfab`}
            src={embedUrl(model)}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
            onLoad={() => setState('ready')}
            className="absolute inset-0 size-full border-0"
          />
        )}
        {state === 'loading' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="eyebrow flex items-center gap-3 bg-black/60 px-4 py-3 text-white">
              <Loader2 className="size-4 animate-spin" /> Loading the 3D model
            </span>
          </div>
        )}

        {model && !active && (
          <div className="absolute inset-x-0 bottom-[7%] flex justify-center">
            {LINK_ONLY ? (
              <a
                href={modelPageUrl(model)}
                target="_blank"
                rel="noreferrer"
                className="eyebrow flex h-12 items-center gap-3 bg-white px-6 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
              >
                <Box className="size-4" strokeWidth={1.5} /> Explore in 3D <ExternalLink className="size-3.5" strokeWidth={1.5} />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setState('loading')}
                className="eyebrow flex h-12 items-center gap-3 bg-white px-6 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
              >
                <Box className="size-4" strokeWidth={1.5} /> Explore in 3D
              </button>
            )}
          </div>
        )}
        {active && (
          <button
            type="button"
            onClick={() => setState('idle')}
            className="eyebrow absolute top-3 right-3 flex h-10 items-center gap-2 bg-black/70 px-3 text-white hover:bg-black"
          >
            <X className="size-4" strokeWidth={1.5} /> Close 3D
          </button>
        )}
      </div>
      {LINK_ONLY && !active && model && (
        <p className="sr-only">The 3D model opens on Sketchfab in a new tab.</p>
      )}
    </div>
  )
}
