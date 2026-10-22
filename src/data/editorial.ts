import { asset } from '@/lib/asset'
import { carImage } from '@/data/showroom'

/**
 * Editorial content for the home page. The club has no content service yet, so these are
 * written samples; the pages mark them as demo content.
 */

export type CoverSlide = {
  id: string
  kicker: string
  title: [string, string]
  standfirst: string
  cta: { label: string; to: string }
  caption: { label: string; title: string; to: string }
  image: { src: string; srcSet: string; alt: string; position: string; tone: 'photo' | 'studio' }
}

export const coverSlides: CoverSlide[] = [
  {
    id: 'pursuit',
    kicker: 'Drives / Cars / People / Extraordinary experiences',
    title: ['The pursuit', 'of extraordinary.'],
    standfirst: 'Exceptional cars. Remarkable places. A private community for those who live to drive.',
    cta: { label: 'Explore the club', to: '/dashboard' },
    caption: { label: 'Featured drive', title: 'Autumn run over Snake Pass', to: '/events' },
    image: {
      src: asset('images/editorial/amalfi-coast-1672.webp'),
      srcSet: `${asset('images/editorial/amalfi-coast-960.webp')} 960w, ${asset('images/editorial/amalfi-coast-1672.webp')} 1672w`,
      alt: 'A dark grand tourer on a cliff road above the sea at sunset',
      position: '78% 50%',
      tone: 'photo',
    },
  },
  {
    id: 'showroom',
    kicker: 'The showroom',
    title: ['Every angle,', 'on request.'],
    standfirst: 'Open any car in the register and walk all the way around it in 3D.',
    cta: { label: 'Visit the showroom', to: '/cars/lamborghini-revuelto' },
    caption: { label: 'In the showroom', title: 'Lamborghini Revuelto', to: '/cars/lamborghini-revuelto' },
    image: { ...carImage('lamborghini-revuelto', 'dark'), alt: 'Lamborghini Revuelto in the studio', position: '62% 55%', tone: 'studio' },
  },
  {
    id: 'garage',
    kicker: 'Your garage',
    title: ['A catalogue', 'of your own.'],
    standfirst: 'Keep your cars, their mileage and their service dates in one place, and share them with the club when you choose.',
    cta: { label: 'Open your garage', to: '/garage' },
    caption: { label: 'From the Club Collection', title: 'Aston Martin Vanquish', to: '/cars/aston-martin-vanquish' },
    image: { ...carImage('aston-martin-vanquish', 'dark'), alt: 'Aston Martin Vanquish in the studio', position: '62% 55%', tone: 'studio' },
  },
]

export type Story = {
  id: string
  kind: 'Experience' | 'Vehicle' | 'People'
  title: string
  standfirst: string
  to: string
  image: { src: string; srcSet?: string; alt: string }
}

export const featuredStories: Story[] = [
  {
    id: 'alpine-driving-tour',
    kind: 'Experience',
    title: 'The Alpine Driving Tour',
    standfirst: 'Five passes in three days, and the case for leaving before breakfast.',
    to: '/events',
    image: {
      src: asset('images/editorial/alpine-drive-1160.webp'),
      srcSet: `${asset('images/editorial/alpine-drive-640.webp')} 640w, ${asset('images/editorial/alpine-drive-1160.webp')} 1160w`,
      alt: 'Two sports cars on a mountain road below snow-capped peaks',
    },
  },
  {
    id: 'amalfi-arrives',
    kind: 'Vehicle',
    title: 'Ferrari Amalfi',
    standfirst: "The Roma's successor brings a 640 CV V8 and some physical buttons back to the cabin.",
    to: '/cars/ferrari-amalfi',
    image: { ...carImage('ferrari-amalfi', 'dark'), alt: 'Ferrari Amalfi in the studio' },
  },
  {
    id: 'passion-shared',
    kind: 'People',
    title: 'A Passion Shared',
    standfirst: 'Sixteen members, ten marques and one long table: meet the people behind the cars.',
    to: '/members',
    image: { ...carImage('bentley-continental-gt-speed', 'dark'), alt: 'Bentley Continental GT Speed in the studio' },
  },
]

export type ClubUpdate = { id: string; kind: 'Journal' | 'Club' | 'Vehicle'; title: string; detail: string; daysAgo: number; to: string }

export const clubUpdates: ClubUpdate[] = [
  { id: 'u1', kind: 'Club', title: 'Winter supper seating plan published', detail: 'Check your table before 1 December.', daysAgo: 1, to: '/events' },
  { id: 'u2', kind: 'Journal', title: 'A new chapter for the club journal', detail: 'Longer stories, fewer of them, every month.', daysAgo: 3, to: '/' },
  { id: 'u3', kind: 'Vehicle', title: 'Ten cars now viewable in 3D', detail: 'Every car in the register opens in the showroom.', daysAgo: 6, to: '/garage/collection' },
]
