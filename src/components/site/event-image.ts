import type { ClubEvent } from '@/data/events'
import { carImage } from '@/data/showroom'
import { asset } from '@/lib/asset'

const STUDIO_CARS = ['porsche-911-gt3-rs', 'mclaren-750s', 'bentley-continental-gt-speed', 'rolls-royce-spectre', 'aston-martin-vanquish', 'ferrari-amalfi']

/** Illustrative image for an event: the mountain-road photograph for drives, a studio car otherwise. */
export function eventImage(event: ClubEvent): { src: string; srcSet?: string; alt: string } {
  if (event.kind === 'drive') {
    return {
      src: asset('images/editorial/alpine-drive-1160.webp'),
      srcSet: `${asset('images/editorial/alpine-drive-640.webp')} 640w, ${asset('images/editorial/alpine-drive-1160.webp')} 1160w`,
      alt: 'Illustrative photograph: sports cars on a mountain road',
    }
  }
  const hash = [...event.id].reduce((n, ch) => n + ch.charCodeAt(0), 0)
  const id = STUDIO_CARS[hash % STUDIO_CARS.length]
  return { ...carImage(id, 'dark'), alt: '' }
}
