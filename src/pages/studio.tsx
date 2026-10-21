import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import { CarViewer } from '@/components/viewer/car-viewer'
import { cars } from '@/data/cars'

/** A bare stage used to render the still images of each car. */
export default function StudioPage() {
  const { carId } = useParams()
  const [params] = useSearchParams()
  const car = cars.find((c) => c.id === carId) ?? cars[0]
  const colour = params.get('colour') ?? car.colours[0].hex
  const [azimuth, setAzimuth] = useState<number | undefined>(params.has('azimuth') ? Number(params.get('azimuth')) : undefined)
  useEffect(() => {
    // Lets the frame-rendering script turn the car without reloading the page.
    ;(window as Window & { setAzimuth?: (a: number) => void }).setAzimuth = setAzimuth
  }, [])
  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = 'transparent'
    return () => {
      document.body.style.background = prev
    }
  }, [])
  return (
    <div className="h-dvh w-full" style={{ background: params.get('bg') ?? 'transparent' }}>
      <CarViewer car={car} colour={colour} still={params.has('still')} azimuth={azimuth} showHotspots={!params.has('still')} />
    </div>
  )
}
