import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cars } from '@/data/cars'
import { members, shows } from '@/data/members'
import { CarImage } from './car-silhouette'

const items = members.filter((m) => shows(m, 'cars')).flatMap((m) =>
  m.carIds.flatMap((carId) => {
    const car = cars.find((c) => c.id === carId)
    return car ? [{ member: m, car, colour: m.carColours[carId] ?? car.colours[0].hex }] : []
  }),
)

export function ClubGarages() {
  const rail = useRef<HTMLUListElement>(null)
  const scroll = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  return (
    <section aria-labelledby="garages-title">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 id="garages-title" className="type-display text-[clamp(2rem,3.4vw,2.75rem)] text-ivory">
          In the club&rsquo;s garages
        </h2>
        <div className="hidden gap-2 md:flex">
          <Button variant="outline" size="icon" aria-label="Scroll garages left" onClick={() => scroll(-1)}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" aria-label="Scroll garages right" onClick={() => scroll(1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <ul
        ref={rail}
        className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 md:scroll-pl-10 gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ member, car, colour }) => (
          <li key={`${member.id}-${car.id}`} className="w-[78%] shrink-0 snap-start sm:w-[340px]">
            <Link to={`/cars/${car.id}`} className="panel interactive group block overflow-hidden">
              <div className="field-verde grid h-44 place-items-center px-6">
                <CarImage
                  carId={car.id}
                  colour={colour}
                  alt={`${member.name}'s ${car.make} ${car.model}`}
                  className="h-full w-full transition-transform duration-500 ease-(--ease-luxe) group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="type-display text-2xl text-ivory">
                  {car.make} {car.model}
                </p>
                <p className="mt-2 text-label text-ivory">{member.name}</p>
                {shows(member, 'city') && <p className="text-label text-smoke">{member.city}</p>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
