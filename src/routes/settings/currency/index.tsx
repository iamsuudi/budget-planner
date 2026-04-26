import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { CURRENCIES, useCurrency } from '#/lib/currency-context'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/settings/currency/')({
  component: CurrencyPage,
})

function CurrencyPage() {
  const navigate = useNavigate()
  const { currency: currentCurrency, setCurrency } = useCurrency()
  const [search, setSearch] = useState('')

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.cc.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = async (code: string) => {
    await setCurrency(code)
    navigate({ to: '/settings' })
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar title="Select Currency" showBack backTo={'/settings'} />

      <Page className="">
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          {filteredCurrencies.map((c) => (
            <button
              key={c.cc}
              onClick={() => handleSelect(c.cc)}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-violet-400 w-8">
                  {c.symbol}
                </span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {c.name}
                  </p>
                  <p className="text-xs text-slate-500">{c.cc}</p>
                </div>
              </div>
              {currentCurrency.cc === c.cc && (
                <span className="material-symbols-outlined text-tertiary text-lg">
                  check_circle
                </span>
              )}
            </button>
          ))}
        </div>
      </Page>
    </div>
  )
}
