import { useState } from 'react'

import { cn } from '@/lib/utils'

export function CarSilhouette({ colour, className }: { colour: string; className?: string }) {
  return (
    <svg viewBox="0 0 400 140" className={className} role="img" aria-label="Car silhouette" fill="none">
      <defs>
        <linearGradient id="sil-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="124" rx="170" ry="7" fill="#000" opacity="0.55" />
      <path
        d="M22 104 C22 92 30 86 52 82 L120 72 C140 50 168 38 208 38 C246 38 276 52 292 70 L350 80 C372 84 380 92 380 104 L380 110 L22 110 Z"
        fill={colour}
      />
      <path
        d="M22 104 C22 92 30 86 52 82 L120 72 C140 50 168 38 208 38 C246 38 276 52 292 70 L350 80 C372 84 380 92 380 104 L380 110 L22 110 Z"
        fill="url(#sil-shade)"
      />
      <path d="M140 70 C158 54 182 47 208 47 C236 47 258 57 272 70 Z" fill="#050807" opacity="0.78" />
      <path d="M208 47 L208 70" stroke={colour} strokeWidth="3" opacity="0.9" />
      <circle cx="104" cy="108" r="21" fill="#050807" />
      <circle cx="104" cy="108" r="11" fill="#17201d" stroke="#cdb98f" strokeOpacity="0.5" />
      <circle cx="302" cy="108" r="21" fill="#050807" />
      <circle cx="302" cy="108" r="11" fill="#17201d" stroke="#cdb98f" strokeOpacity="0.5" />
    </svg>
  )
}

/** Shows the studio render when present, and a tinted silhouette otherwise. */
export function CarImage({ carId, colour, alt, className }: { carId: string; colour: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <CarSilhouette colour={colour} className={className} />
  return (
    <img
      src={`/renders/${carId}.webp`}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-contain', className)}
    />
  )
}
