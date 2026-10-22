import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { RequireMember } from '@/components/layout/require-member'
import { AuthProvider } from '@/lib/auth'
import { GarageProvider } from '@/lib/garage'
import { RsvpProvider } from '@/lib/rsvp'
import { AccountPage } from '@/pages/account'
import { DashboardPage } from '@/pages/dashboard'
import { EventsPage } from '@/pages/events'
import { HomePage } from '@/pages/home'
import { MembersPage } from '@/pages/members'
import { SignInPage } from '@/pages/sign-in'

const GaragePage = lazy(() => import('@/pages/garage'))
const CarPage = lazy(() => import('@/pages/car'))

// A static preview (no Worker, opened from a sub-folder) uses hash URLs so every page loads.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

export default function App() {
  return (
    <AuthProvider>
      <GarageProvider>
        <RsvpProvider>
          <Router>
            <Suspense fallback={<div className="min-h-dvh bg-paper" />}>
              <Routes>
                <Route path="/sign-in" element={<SignInPage />} />
                <Route element={<RequireMember />}>
                  <Route element={<AppShell />}>
                    <Route index element={<HomePage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="garage" element={<GaragePage />} />
                    <Route path="garage/collection" element={<GaragePage />} />
                    <Route path="cars/:carId" element={<CarPage />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="members" element={<MembersPage />} />
                    <Route path="account" element={<AccountPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </RsvpProvider>
      </GarageProvider>
    </AuthProvider>
  )
}
