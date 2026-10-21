import { HeroScrub } from '@/components/ui/hero-scrub'
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
  ? { frameCount: 120, titleBottom: '458 Spider', frameUrl: (i: number) => asset(`hero/${String(i + 1).padStart(4, '0')}.webp`) }
  : {
      frameCount: 300,
      titleBottom: 'Amalfi',
      frameUrl: (i: number) =>
        `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, '0')}.webp`,
    }

export function HomePage() {
  const upcoming = upcomingEvents()
  return (
    <div>
      <HeroScrub frameCount={hero.frameCount} frameUrl={hero.frameUrl} titleTop="Ferrari" titleBottom={hero.titleBottom} accentHex="#3a9b8a" />
      <WelcomeBand />
      <div className="relative overflow-hidden">
        <SteeringWheel className="pointer-events-none absolute -left-24 top-[55%] hidden h-80 w-80 text-champagne opacity-[0.12] lg:block" />
        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-6 py-16 md:px-10 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-8">
            <UpcomingEvents events={upcoming.slice(0, 5)} />
          </div>
          <div className="lg:col-span-4">
            <ServiceReminders />
          </div>
        </div>
        <div className="relative mx-auto max-w-[1440px] px-6 pb-28 md:px-10 lg:pb-24">
          <KeyFob className="pointer-events-none absolute -top-10 right-10 hidden h-44 w-44 rotate-12 text-champagne opacity-[0.15] md:block" />
          <ClubGarages />
        </div>
      </div>
      <HomeFooter />
      <div className="h-24 md:hidden" aria-hidden />
    </div>
  )
}
