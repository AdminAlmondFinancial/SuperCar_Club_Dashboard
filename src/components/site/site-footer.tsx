import { Link } from 'react-router-dom'

import { Wordmark } from '@/components/site/primitives'

export function SiteFooter() {
  return (
    <footer className="border-t border-obsidian-line bg-obsidian text-white">
      <div className="page-gutter mx-auto grid max-w-[1520px] gap-10 py-14 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-[40ch] text-[13px] leading-relaxed text-fog">A private members&rsquo; club for people who live to drive. Membership is by invitation.</p>
        </div>
        <nav aria-label="Club" className="grid content-start gap-3 text-[13px] text-fog">
          <p className="eyebrow text-[10px] text-white">The club</p>
          <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link to="/events" className="hover:text-white">Events</Link>
          <Link to="/members" className="hover:text-white">Members</Link>
        </nav>
        <nav aria-label="Cars" className="grid content-start gap-3 text-[13px] text-fog">
          <p className="eyebrow text-[10px] text-white">Cars</p>
          <Link to="/garage" className="hover:text-white">My Garage</Link>
          <Link to="/garage/collection" className="hover:text-white">Club Collection</Link>
          <Link to="/account" className="hover:text-white">Your account</Link>
        </nav>
      </div>
      <div className="page-gutter mx-auto flex max-w-[1520px] flex-wrap justify-between gap-3 border-t border-obsidian-line py-6 text-[11px] text-fog">
        <span>&copy; {new Date().getFullYear()} SuperCar Club</span>
        <span>3D models and studio stills by their Sketchfab creators, credited on each car.</span>
      </div>
    </footer>
  )
}
