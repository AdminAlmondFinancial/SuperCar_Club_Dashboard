export type ClubEvent = {
  id: string
  title: string
  kind: 'drive' | 'meet' | 'track' | 'social'
  date: string
  endDate?: string
  venue: string
  region: string
  description: string
  capacity: number
  attendeeIds: string[]
  hostId: string
  dressCode?: string
  routeKm?: number
}

export const events: ClubEvent[] = [
  {
    id: 'snake-pass-autumn-run',
    title: 'Autumn run over Snake Pass',
    kind: 'drive',
    date: '2026-10-25T07:30:00Z',
    venue: 'Snake Pass, A57',
    region: 'Peak District',
    description: 'A morning crossing of the Peak District as the leaves turn, with a long breakfast stop in Glossop. Fuel up before the climb, because the road has no services for 40 kilometres.',
    capacity: 24,
    attendeeIds: ['tom-whitfield', 'hannah-lovell', 'yusuf-demir', 'oliver-banks', 'ngozi-eze', 'daniel-fraser', 'eleanor-strand', 'jamie-chen'],
    hostId: 'tom-whitfield',
    dressCode: 'Warm layers and driving gloves',
    routeKm: 142,
  },
  {
    id: 'bicester-heritage-sunday-meet',
    title: 'Sunday meet at Bicester Heritage',
    kind: 'meet',
    date: '2026-11-08T09:00:00Z',
    venue: 'Bicester Heritage',
    region: 'Oxfordshire',
    description: 'An open-air meet among the old hangars, with coffee from the workshop kiosk and a slow walk along the cars. Bring a folding chair if you want a front-row view of the afternoon.',
    capacity: 60,
    attendeeIds: ['priya-raman', 'amara-okafor', 'sofia-marchetti', 'callum-ferguson', 'imogen-hale', 'jamie-chen', 'ravi-khanna', 'rhys-pritchard', 'hannah-lovell', 'daniel-fraser', 'oliver-banks', 'eleanor-strand'],
    hostId: 'priya-raman',
    dressCode: 'Smart casual',
  },
  {
    id: 'donington-track-day',
    title: 'Track day at Donington Park',
    kind: 'track',
    date: '2026-11-21T08:00:00Z',
    venue: 'Donington Park Circuit',
    region: 'Leicestershire',
    description: 'Two groups of sixteen take turns on the National Circuit with a coach in the passenger seat for the first session. Helmets are provided, and the pit lane briefing starts at half past eight.',
    capacity: 16,
    attendeeIds: ['kwame-mensah', 'tom-whitfield', 'callum-ferguson', 'yusuf-demir', 'ngozi-eze', 'rhys-pritchard', 'jamie-chen', 'daniel-fraser'],
    hostId: 'kwame-mensah',
    dressCode: 'Race suits or fitted overalls, no loose clothing',
  },
  {
    id: 'members-winter-supper',
    title: 'Members winter supper',
    kind: 'social',
    date: '2026-12-05T18:30:00Z',
    endDate: '2026-12-05T22:30:00Z',
    venue: 'Private dining room, Marylebone',
    region: 'London',
    description: 'The annual dinner with a long table, a short speech, and the usual argument about which car has the best seats. Partners are welcome, and taxis are arranged for anyone who has had a glass of something good.',
    capacity: 40,
    attendeeIds: ['amara-okafor', 'sofia-marchetti', 'imogen-hale', 'priya-raman', 'kwame-mensah', 'ravi-khanna', 'eleanor-strand', 'tom-whitfield', 'hannah-lovell', 'oliver-banks'],
    hostId: 'amara-okafor',
    dressCode: 'Black tie optional',
  },
  {
    id: 'cotswold-winter-loop',
    title: 'Winter loop through the Cotswolds',
    kind: 'drive',
    date: '2026-12-12T08:00:00Z',
    venue: 'Burford High Street',
    region: 'Oxfordshire and Gloucestershire',
    description: 'A loop of quiet lanes past stone villages, with a pub lunch booked in Stow-on-the-Wold. Cars leave in pairs five minutes apart, so keep your distance on the frosty corners.',
    capacity: 20,
    attendeeIds: ['hannah-lovell', 'oliver-banks', 'yusuf-demir', 'ngozi-eze', 'rhys-pritchard', 'daniel-fraser', 'jamie-chen'],
    hostId: 'hannah-lovell',
    dressCode: 'Warm layers',
    routeKm: 178,
  },
  {
    id: 'goodwood-festive-lights',
    title: 'Festive lights at Goodwood',
    kind: 'meet',
    date: '2026-12-19T16:00:00Z',
    venue: 'Goodwood Motor Circuit',
    region: 'West Sussex',
    description: 'The paddock is strung with lights for an evening of mulled cider and cars parked nose to tail. Families are welcome until seven, when the grandstand lights go down.',
    capacity: 50,
    attendeeIds: ['imogen-hale', 'amara-okafor', 'ravi-khanna', 'sofia-marchetti', 'priya-raman', 'tom-whitfield', 'callum-ferguson', 'eleanor-strand', 'kwame-mensah'],
    hostId: 'imogen-hale',
    dressCode: 'Festive and warm',
  },
  {
    id: 'goodwood-dawn-run',
    title: 'Dawn run to Goodwood',
    kind: 'drive',
    date: '2027-01-16T07:00:00Z',
    venue: 'Goodwood Motor Circuit',
    region: 'West Sussex',
    description: 'We leave Chichester in the dark and arrive as the sun clears the Downs, with a short hot-drink stop on the way. The circuit gates open early for us, so the paddock is ours for half an hour.',
    capacity: 18,
    attendeeIds: ['ravi-khanna', 'imogen-hale', 'jamie-chen', 'daniel-fraser', 'rhys-pritchard', 'oliver-banks', 'sofia-marchetti'],
    hostId: 'ravi-khanna',
    dressCode: 'Warm layers and a hat',
    routeKm: 96,
  },
  {
    id: 'brecon-beacons-weekend',
    title: 'Weekend in the Brecon Beacons',
    kind: 'drive',
    date: '2027-02-06T08:00:00Z',
    endDate: '2027-02-07T17:00:00Z',
    venue: 'Brecon Beacons National Park',
    region: 'Powys',
    description: 'Two days of mountain roads, with a Saturday night in a shared lodge and a Sunday loop past the reservoirs. Pack for wet weather and bring your own supplies for the evening.',
    capacity: 22,
    attendeeIds: ['callum-ferguson', 'rhys-pritchard', 'yusuf-demir', 'hannah-lovell', 'oliver-banks', 'kwame-mensah', 'ngozi-eze', 'daniel-fraser'],
    hostId: 'callum-ferguson',
    dressCode: 'Waterproofs and sturdy boots',
    routeKm: 310,
  },
  {
    id: 'silverstone-club-day',
    title: 'Club day at Silverstone',
    kind: 'track',
    date: '2027-03-06T09:00:00Z',
    venue: 'Silverstone Circuit',
    region: 'Northamptonshire',
    description: 'A club day on the Arena loop with timed sessions, a paddock lunch, and a coach on hand for anyone trying the circuit for the first time. Sessions are split by experience, so nobody is pushed past their comfort.',
    capacity: 20,
    attendeeIds: ['eleanor-strand', 'tom-whitfield', 'kwame-mensah', 'priya-raman', 'callum-ferguson', 'sofia-marchetti', 'yusuf-demir', 'ravi-khanna'],
    hostId: 'eleanor-strand',
    dressCode: 'Race suits or fitted overalls, no loose clothing',
  },
  {
    id: 'brighton-spring-terrace',
    title: 'Spring opening on the Brighton terrace',
    kind: 'social',
    date: '2027-03-27T18:00:00Z',
    endDate: '2027-03-27T21:30:00Z',
    venue: 'Brighton seafront terrace',
    region: 'East Sussex',
    description: 'An evening on the seafront to mark the start of the open-top season, with small plates and a sunset walk along the front. Cars are parked along the promenade, so arrive early for a good spot.',
    capacity: 30,
    attendeeIds: ['jamie-chen', 'imogen-hale', 'ravi-khanna', 'sofia-marchetti', 'amara-okafor', 'ngozi-eze', 'rhys-pritchard'],
    hostId: 'jamie-chen',
    dressCode: 'Smart casual with a jacket for the wind',
  },
]

export function upcomingEvents(from: Date = new Date()): ClubEvent[] {
  const cutoff = from.getTime()
  return events
    .filter((event) => new Date(event.date).getTime() >= cutoff)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function eventKindLabel(kind: ClubEvent['kind']): string {
  switch (kind) {
    case 'drive':
      return 'Drive'
    case 'meet':
      return 'Car meet'
    case 'track':
      return 'Track day'
    case 'social':
      return 'Social'
  }
}
