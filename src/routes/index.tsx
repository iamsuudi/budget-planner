import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { TopAppBar, BottomNavBar, GlassCard, ProgressBar } from '../components/ui'
import { getInvoicesByMonth, getMonthBudget } from '../lib/storage'
import { useMonth } from '../lib/month-context'
import { useCurrency } from '../lib/currency-context'
import type { Invoice, MonthBudget } from '../types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const navItems = [
  { icon: 'home', label: 'Home', to: '/', active: true },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'account_circle', label: 'Profile', to: '/profile' },
  { icon: 'settings', label: 'Settings', to: '/settings' },
]

function HomePage() {
  const { currentMonth, goToPrevMonth, goToNextMonth, isCurrentMonth } = useMonth()
  const { formatAmount } = useCurrency()
  const { year, month, monthName } = currentMonth
  
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [monthBudget, setMonthBudgetData] = useState<MonthBudget | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [year, month])

  async function loadData() {
    setLoading(true)
    try {
      const [invData, budgetData] = await Promise.all([
        getInvoicesByMonth(year, month),
        getMonthBudget(year, month)
      ])
      setInvoices(invData)
      setMonthBudgetData(budgetData || null)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalExpenses = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.amount, 0)
  }, [invoices])

  const budgetPercentage = useMemo(() => {
    if (!monthBudget?.totalBudget || monthBudget.totalBudget === 0) return 0
    return Math.min((totalExpenses / monthBudget.totalBudget) * 100, 100)
  }, [totalExpenses, monthBudget])

  const canGoNext = !isCurrentMonth(year, month)

  return (
    <div className="min-h-screen bg-surface-dim text-on-surface antialiased">
      <TopAppBar />
      
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-10">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={goToPrevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-white/5 text-secondary hover:text-secondary-fixed transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="text-center min-w-[140px]">
              <h2 className="text-2xl font-bold text-on-surface">
                {monthName} {year}
              </h2>
            </div>
            <button onClick={goToNextMonth} disabled={!canGoNext} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-white/5 text-secondary hover:text-secondary-fixed transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          {monthBudget && monthBudget.totalBudget > 0 && (
            <div className="hidden md:flex gap-2">
              <span className={`px-4 py-1 rounded-full text-sm font-semibold ${budgetPercentage >= 100 ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'}`}>
                {budgetPercentage >= 100 ? 'Over Budget' : budgetPercentage >= 80 ? 'Near Limit' : 'On Track'}
              </span>
            </div>
          )}
        </div>

        {/* Main Hero Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-xl">
              <div>
                <p className="text-sm font-semibold text-on-surface-variant opacity-70 mb-1">
                  Total Expenses
                </p>
                <h1 className="text-5xl font-extrabold text-on-surface tracking-tight">
                  {formatAmount(totalExpenses)}
                </h1>
              </div>
              <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                    Monthly Budget
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400 text-sm">flag</span>
                    <p className="text-2xl font-bold text-secondary">
                      {formatAmount(monthBudget?.totalBudget || 0)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                    Remaining
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-sm">savings</span>
                    <p className={`text-2xl font-bold ${(monthBudget?.totalBudget || 0) - totalExpenses >= 0 ? 'text-tertiary' : 'text-error'}`}>
                      {formatAmount(Math.max((monthBudget?.totalBudget || 0) - totalExpenses, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-6">
            <Link to="/expense/add" className="flex-1 bg-primary-container text-on-primary-fixed-variant rounded-[1.5rem] p-6 flex flex-col items-start justify-between shadow-lg glow-violet hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-4xl">add_circle</span>
              <div className="text-left">
                <p className="text-2xl font-bold leading-tight">
                  Add<br />Expense
                </p>
              </div>
            </Link>
            <Link to="/budget" className="flex-1 border border-secondary text-secondary rounded-[1.5rem] p-6 flex flex-col items-start justify-between hover:bg-secondary/10 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-4xl">payments</span>
              <div className="text-left">
                <p className="text-2xl font-bold leading-tight text-on-surface">
                  Set<br />Budget
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Budget Progress */}
        {monthBudget && monthBudget.totalBudget > 0 && (
          <GlassCard>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-on-surface">
                Monthly Budget Progress
              </p>
              <p className={`text-sm font-semibold ${budgetPercentage >= 100 ? 'text-error' : 'text-tertiary'}`}>
                {budgetPercentage.toFixed(0)}% of ${monthBudget.totalBudget.toLocaleString()} used
              </p>
            </div>
            <ProgressBar percentage={budgetPercentage} color="gradient" showGlow={budgetPercentage >= 80} />
          </GlassCard>
        )}

        {/* Transaction List */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-2xl font-bold text-on-surface">
              Recent Transactions
            </h3>
          </div>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : invoices.length === 0 ? (
            <p className="text-slate-500">No expenses recorded for this month.</p>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 10).map((inv) => (
                <div key={inv.id} className="glass-card flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-high transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">receipt</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{inv.note || inv.categoryName}</p>
                      <p className="text-xs text-on-surface-variant opacity-60">
                        {inv.categoryName} • {new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-on-surface">
                      -{formatAmount(inv.amount)}
                    </p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                      {inv.paymentMethodName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNavBar items={navItems} />
    </div>
  )
}