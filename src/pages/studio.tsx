import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { CarViewer, type ViewMode } from '@/components/viewer/car-viewer'
import { cars } from '@/data/cars'

/** A bare stage used to render the still images of each car. */
export default function StudioPage() {
  const { carId } = useParams()
  const [params] = useSearchParams()
  const car = cars.find((c) => c.id === carId) ?? cars[0]
  const mode = (params.get('mode') as ViewMode) ?? 'exterior'
  const colour = params.get('colour') ?? car.colours[0].hex
  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = 'transparent'
    return () => {
      document.body.style.background = prev
    }
  }, [])
  return (
    <div className="h-dvh w-full" style={{ background: params.get('bg') ?? 'transparent' }}>
      <CarViewer car={car} colour={colour} mode={mode} still={params.has('still')} showHotspots={!params.has('still')} />
    </div>
  )
}
