import type { Car } from '@/data/cars'
import { cn } from '@/lib/utils'

/** Still image of a car, rendered from its 3D model (see public/renders). */
export function CarRender({ car, className }: { car: Car; className?: string }) {
  return (
    <img
      src={`/renders/${car.id}.webp`}
      alt={`${car.make} ${car.model}`}
      loading="lazy"
      className={cn('pointer-events-none object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.6)] select-none', className)}
    />
  )
}
