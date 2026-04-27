import { createFileRoute, Link } from '@tanstack/react-router'
import { PlusCircle, FolderPlus } from 'lucide-react'
import { useMemo } from 'react'
import {
  useGetInvoicesByMonth,
  useGetCategories,
  useGetWallets,
} from '#/hooks/query'
import { useMonth } from '#/lib/month-context'
import { formatCurrency } from '#/lib/currency'
import { getIconStyle } from '#/lib/icons'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { CalendarNav } from '#/components/CalendarNav'
import { Icon } from '#/components/Icon'

export const Route = createFileRoute('/expense/')({
  component: ExpensePage,
})

function ExpensePage() {
  const { currentMonth } = useMonth()
  const { year, month } = currentMonth

  const { data: invoices = [], isLoading } = useGetInvoicesByMonth(
    year,
    month,
    'expense',
  )
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

  const totalExpenses = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.amount, 0)
  }, [invoices])

  return (
    <div className="">
      <TopAppBar showProfile />

      <Page className="space-y-6">
        <CalendarNav />

        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
          <div className="relative z-10 text-center">
            <p className="text-xs font-semibold text-on-surface-variant opacity-70 mb-2">
              Total Expenses
            </p>
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">
              {formatCurrency(totalExpenses)}
            </h1>
          </div>
        </GlassCard>

        <div className="flex gap-3">
          <Link
            to="/expense/categories"
            className="flex-1 border border-tertiary text-tertiary rounded-xl py-3 px-5 flex gap-2 items-center justify-center hover:bg-tertiary/10 active:scale-98 transition-all"
          >
            <FolderPlus className="w-5 h-5" />
            <span className="font-bold text-on-surface">Categories</span>
          </Link>
          <Link
            to="/expense/add"
            className="flex-1 border border-primary text-primary rounded-xl py-3 px-5 flex gap-2 items-center justify-center hover:bg-primary/10 active:scale-98 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-bold text-on-surface">Add Expense</span>
          </Link>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">Recent</h3>
            <Link
              to="/expense/transactions"
              className="text-xs text-secondary hover:text-cyan-400 transition-colors"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : invoices.length === 0 ? (
            <p className="text-slate-500 text-sm">No expenses this month.</p>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 8).map((inv) => {
                const category = categoryMap[inv.categoryId]
                const style = getIconStyle(category?.icon || 'receipt')
                return (
                  <div
                    key={inv.id}
                    className="glass-card flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}
                      >
                        <Icon name={category?.icon || 'receipt'} size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {inv.note || category?.name || inv.categoryName}
                        </p>
                        <p className="text-[10px] text-on-surface-variant opacity-60">
                          {category?.name || inv.categoryName}
                          {category?.walletId && walletMap[category.walletId]
                            ? ` • ${walletMap[category.walletId].name}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-on-surface">
                        {formatCurrency(inv.amount)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </Page>
    </div>
  )
}
