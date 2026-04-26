import { Outlet, createRootRoute } from '@tanstack/react-router'
import { MonthProvider } from '#/lib/month-context'
import { CurrencyProvider } from '#/lib/currency-context'

import '#/styles.css'
import { BottomNavBar } from '#/components/BottomNavBar'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <CurrencyProvider>
      <MonthProvider>
        <div className="bg-surface-dim text-on-surface antialiased">
          <div className="relative max-w-md mx-auto min-h-screen">
            <Outlet />
            <BottomNavBar />
          </div>
        </div>
      </MonthProvider>
    </CurrencyProvider>
  )
}
