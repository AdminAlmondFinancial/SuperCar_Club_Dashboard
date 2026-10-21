import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { RequireMember } from '@/components/layout/require-member'
import { AuthProvider } from '@/lib/auth'
import { GarageProvider } from '@/lib/garage'
import { EventsPage } from '@/pages/events'
import { HomePage } from '@/pages/home'
import { MembersPage } from '@/pages/members'
import { SignInPage } from '@/pages/sign-in'

// The 3D viewer pulls in three.js, so it loads only when a car is opened.
const GaragePage = lazy(() => import('@/pages/garage'))
const CarPage = lazy(() => import('@/pages/car'))
const StudioPage = lazy(() => import('@/pages/studio'))

export default function App() {
  return (
    <AuthProvider>
      <GarageProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-dvh bg-ink" />}>
            <Routes>
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/studio/:carId" element={<StudioPage />} />
              <Route element={<RequireMember />}>
                <Route element={<AppShell />}>
                  <Route index element={<HomePage />} />
                  <Route path="garage" element={<GaragePage />} />
                  <Route path="cars/:carId" element={<CarPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="members" element={<MembersPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </GarageProvider>
    </AuthProvider>
  )
}
