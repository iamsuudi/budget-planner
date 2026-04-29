import { Outlet, createRootRoute, useNavigate } from '@tanstack/react-router'
import { MonthProvider } from '#/lib/month-context'
import { SecurityProvider, useSecurity } from '#/lib/security'
import { getActiveCurrency } from '#/lib/currency'
import { useEffect } from 'react'

import '#/styles.css'
import { BottomNavBar } from '#/components/BottomNavBar'
import { SWProgressBar } from '#/components/SWProgressBar'
import { LockScreen } from '#/components/PinInput'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  getActiveCurrency()

  return (
    <SecurityProvider>
      <WelcomeGate>
        <MonthProvider>
          <LockScreen />
          <div className="bg-surface-dim text-on-surface antialiased">
            <div className="relative max-w-lg mx-auto min-h-screen no-scrollbar overflow-auto">
              <div className="h-full">
                <Outlet />
              </div>
              <BottomNavBar />
              <SWProgressBar />
            </div>
          </div>
        </MonthProvider>
      </WelcomeGate>
    </SecurityProvider>
  )
}

function WelcomeGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { isFirstTime } = useSecurity()

  useEffect(() => {
    const welcomeSeen = localStorage.getItem('welcome-seen') === 'true'
    if (!welcomeSeen && isFirstTime) {
      navigate({ to: '/welcome' })
    }
  }, [isFirstTime, navigate])

  return <>{children}</>
}
