import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { HeroScrub } from '@/components/ui/hero-scrub'
import { Button } from '@/components/ui/button'
import { WelcomeBand } from '@/components/home/welcome-band'
import { UpcomingEvents } from '@/components/home/upcoming-events'
import { ServiceReminders } from '@/components/home/service-reminders'
import { ClubGarages } from '@/components/home/club-garages'
import { HomeFooter } from '@/components/home/home-footer'
import { upcomingEvents } from '@/components/home/dates'
import { SteeringWheel, KeyFob } from '@/components/memorabilia'
import { asset } from '@/lib/asset'

// VITE_HERO_LOCAL uses our own 458 Spider turntable frames from public/hero instead of the demo's hosted ones.
const LOCAL_HERO = !!import.meta.env.VITE_HERO_LOCAL
const hero = LOCAL_HERO
  ? { frameCount: 120, titleBottom: '458 Spider', carId: 'ferrari-458-italia', frameUrl: (i: number) => asset(`hero/${String(i + 1).padStart(4, '0')}.webp`) }
  : {
      frameCount: 300,
      titleBottom: 'Amalfi',
      carId: 'ferrari-amalfi',
      frameUrl: (i: number) =>
        `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, '0')}.webp`,
    }

export function HomePage() {
  const [next, ...later] = upcomingEvents()
  return (
    <div>
      {/* The briefing comes first: what is next and what to do about it */}
      <WelcomeBand next={next} />
      <div className="relative overflow-hidden">
        <SteeringWheel className="pointer-events-none absolute -left-24 top-[55%] hidden h-80 w-80 text-champagne opacity-[0.1] lg:block" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-6 py-16 md:px-10 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-8">
            <UpcomingEvents events={later.slice(0, 4)} />
          </div>
          <div className="lg:col-span-4">
            <ServiceReminders />
          </div>
        </div>
      </div>
      <HeroScrub
        frameCount={hero.frameCount}
        frameUrl={hero.frameUrl}
        titleTop="Ferrari"
        titleBottom={hero.titleBottom}
        accentHex="#1b493e"
        eyebrow="Featured from the register"
        action={
          <Button asChild variant="default">
            <Link to={`/cars/${hero.carId}`}>
              Explore in 3D <ArrowRight />
            </Link>
          </Button>
        }
      />
      <div className="relative overflow-hidden">
        <div className="relative mx-auto max-w-[1440px] px-6 py-16 md:px-10 lg:py-20">
          <KeyFob className="pointer-events-none absolute -top-10 right-10 hidden h-44 w-44 rotate-12 text-champagne opacity-[0.12] md:block" />
          <ClubGarages />
        </div>
      </div>
      <HomeFooter />
    </div>
  )
}
