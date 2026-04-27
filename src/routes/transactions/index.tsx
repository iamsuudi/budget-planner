import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import {
  useGetCategories,
  useGetInvoicesByMonth,
  useGetWallets,
} from '#/hooks/query'
import { useMonth } from '#/lib/month-context'
import { formatCurrency } from '#/lib/currency'
import { getIconStyle } from '#/lib/icons'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { CalendarNav } from '#/components/CalendarNav'
import { Icon } from '#/components/Icon'

export const Route = createFileRoute('/transactions/')({
  component: TransactionsPage,
})

function TransactionsPage() {
  const { currentMonth } = useMonth()
  const { year, month } = currentMonth

  const { data: invoices = [], isLoading } = useGetInvoicesByMonth(year, month)
  const { data: categories = [] } = useGetCategories()
  const { data: wallets = [] } = useGetWallets()

  const categoryMap = useMemo(() => {
    const map: Record<
      string,
      { name: string; icon: string; walletId?: string }
    > = {}
    categories.forEach((cat) => {
      map[cat.id] = { name: cat.name, icon: cat.icon, walletId: cat.walletId }
    })
    return map
  }, [categories])

  const walletMap = useMemo(() => {
    const map: Record<string, { name: string; accountNumber: string }> = {}
    wallets.forEach((w) => {
      map[w.id] = { name: w.name, accountNumber: w.accountNumber }
    })
    return map
  }, [wallets])

  const groupedInvoices = useMemo(() => {
    const groups: Record<string, typeof invoices> = {}
    invoices.forEach((inv) => {
      const dateKey = new Date(inv.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(inv)
    })
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    )
  }, [invoices])

  const totalExpenses = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.amount, 0)
  }, [invoices])

  return (
    <div className="">
      <TopAppBar showBack backTo="/" />

      <Page className="space-y-4">
        <CalendarNav locked />

        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            {invoices.length} transaction{invoices.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm font-semibold text-on-surface">
            Total: {formatCurrency(totalExpenses)}
          </p>
        </div>

        {isLoading ? (
          <p className="text-slate-500">Loading...</p>
        ) : invoices.length === 0 ? (
          <p className="text-slate-500 text-sm">No transactions this month.</p>
        ) : (
          <div className="space-y-6">
            {groupedInvoices.map(([dateLabel, dateInvoices]) => (
              <section key={dateLabel}>
                <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2">
                  {dateLabel}
                </h3>
                <div className="space-y-2">
                  {dateInvoices.map((inv) => {
                    const category = categoryMap[inv.categoryId]
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    const wallet = category?.walletId
                      ? walletMap[category.walletId]
                      : null
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    const style = getIconStyle(category?.icon || 'receipt')
                    return (
                      <div
                        key={inv.id}
                        className="glass-card flex items-center justify-between p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}
                          >
                            <Icon name={category.icon || 'receipt'} size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">
                              {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                              {inv.note || category?.name || inv.categoryName}
                            </p>
                            <p className="text-[10px] text-on-surface-variant opacity-60">
                              {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                              {category?.name || inv.categoryName}
                              {wallet && ` • ${wallet.name}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-on-surface">
                            {formatCurrency(inv.amount)}
                          </p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                            {new Date(inv.date).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </Page>
    </div>
  )
}
