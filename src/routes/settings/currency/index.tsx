import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  CURRENCIES,
  setActiveCurrency,
  getActiveCurrency,
} from '#/lib/currency'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/settings/currency/')({
  component: CurrencyPage,
})

function CurrencyPage() {
  // const navigate = useNavigate()
  const [currentCC, setCurrentCC] = useState('USD')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getActiveCurrency().then((c) => setCurrentCC(c.cc))
  }, [])

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.cc.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSelect = async (code: string) => {
    await setActiveCurrency(code)
    setCurrentCC(code)
    // navigate({ to: '/settings' })
  }

  return (
    <div className="">
      <TopAppBar showBack backTo={'/settings'} />

      <Page title="Currency" description="Manage your default currency">
        <div>
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
              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-violet-400 w-12">
                  {c.cc}
                </span>
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {c.name}
                  </p>
                </div>
              </div>
              {currentCC === c.cc && (
                <CheckCircle className="w-5 h-5 text-tertiary" />
              )}
            </button>
          ))}
        </div>
      </Page>
    </div>
  )
}
