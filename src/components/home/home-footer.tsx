import { Link } from 'react-router-dom'

import { Wordmark } from '@/components/layout/crest'

export function HomeFooter() {
  return (
    <footer className="pb-dock border-t border-line md:pb-0">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <Wordmark />
          <p className="mt-3 text-smoke">Drive well, park together, and always wave.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-smoke">
          <Link to="/events" className="hover:text-ivory">Events</Link>
          <Link to="/garage" className="hover:text-ivory">Your garage</Link>
          <Link to="/members" className="hover:text-ivory">Members</Link>
          <a href="mailto:hello@supercar.club" className="hover:text-ivory">Contact the committee</a>
        </nav>
      </div>
    </footer>
  )
}
