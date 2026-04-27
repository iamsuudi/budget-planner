import { Outlet, createRootRoute } from '@tanstack/react-router'
import { MonthProvider } from '#/lib/month-context'
import { SecurityProvider } from '#/lib/security'
import { getActiveCurrency } from '#/lib/currency'

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
    </SecurityProvider>
  )
}