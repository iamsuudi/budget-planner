import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { TopAppBar } from '#/components/TopAppBar'
import { useCurrency, CURRENCIES } from '#/lib/currency-context'

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

      <main className="pt-20 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currency..."
            className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filteredCurrencies.map((c) => (
            <button
              key={c.cc}
              onClick={() => handleSelect(c.cc)}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-violet-400 w-12">
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
                <span className="material-symbols-outlined text-tertiary">
                  check_circle
                </span>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
