import { Outlet, createRootRoute } from '@tanstack/react-router'
import { MonthProvider } from '#/lib/month-context'
import { CurrencyProvider } from '#/lib/currency-context'

import '#/styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <CurrencyProvider>
      <MonthProvider>
        <div className="min-h-screen bg-surface-dim text-on-surface antialiased">
          <div className="max-w-md mx-auto">
            <Outlet />
          </div>
        </div>
      </MonthProvider>
    </CurrencyProvider>
  )
}
