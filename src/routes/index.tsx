import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Flag, PiggyBank, PlusCircle, Wallet, Receipt } from 'lucide-react'
import { useMemo } from 'react'
import { useGetInvoicesByMonth, useGetMonthBudget } from '#/hooks/query'
import { useMonth } from '#/lib/month-context'
import { useCurrency } from '#/lib/currency-context'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { ProgressBar } from '#/components/ProgressBar'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { currentMonth, goToPrevMonth, goToNextMonth, isCurrentMonth } =
    useMonth()
  const { formatAmount } = useCurrency()
  const { year, month, monthName } = currentMonth

  const { data: invoices = [], isLoading } = useGetInvoicesByMonth(year, month)
  const { data: monthBudget } = useGetMonthBudget(year, month)

  const totalExpenses = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.amount, 0)
  }, [invoices])

  const budgetPercentage = useMemo(() => {
    if (!monthBudget?.totalBudget || monthBudget.totalBudget === 0) return 0
    return Math.min((totalExpenses / monthBudget.totalBudget) * 100, 100)
  }, [totalExpenses, monthBudget])

  const canGoNext = !isCurrentMonth(year, month)

  return (
    <div className="">
      <TopAppBar />

      <Page className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container border border-white/5 text-secondary hover:text-secondary-fixed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-on-surface">
                {monthName} {year}
              </h2>
            </div>
            <button
              onClick={goToNextMonth}
              disabled={!canGoNext}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container border border-white/5 text-secondary hover:text-secondary-fixed transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {monthBudget && monthBudget.totalBudget > 0 && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${budgetPercentage >= 100 ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'}`}
            >
              {budgetPercentage >= 100
                ? 'Over'
                : budgetPercentage >= 80
                  ? 'Near'
                  : 'On Track'}
            </span>
          )}
        </div>

        <GlassCard className="p-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-secondary/10 blur-[60px] rounded-full" />
          <div className="relative z-10">
            <p className="text-xs font-semibold text-on-surface-variant opacity-70 mb-1">
              Total Expenses
            </p>
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">
              {formatAmount(totalExpenses)}
            </h1>
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-4">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                  Budget
                </p>
                <div className="flex items-center gap-1">
                  <Flag className="w-4 h-4 text-cyan-400" />
                  <p className="text-lg font-bold text-secondary">
                    {formatAmount(monthBudget?.totalBudget || 0)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
                  Remaining
                </p>
                <div className="flex items-center gap-1">
                  <PiggyBank className="w-4 h-4 text-tertiary" />
                  <p
                    className={`text-lg font-bold ${(monthBudget?.totalBudget || 0) - totalExpenses >= 0 ? 'text-tertiary' : 'text-error'}`}
                  >
                    {formatAmount(
                      Math.max(
                        (monthBudget?.totalBudget || 0) - totalExpenses,
                        0,
                      ),
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3">
          <Link
            to="/expense/add"
            className="bg-primary-container text-on-primary-fixed-variant rounded-xl p-4 flex items-center justify-between shadow-lg glow-violet hover:brightness-110 active:scale-98 transition-all"
          >
            <PlusCircle className="w-6 h-6" />
            <span className="text-lg font-bold">Add Expense</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            to="/budget"
            className="border border-secondary text-secondary rounded-xl p-4 flex items-center justify-between hover:bg-secondary/10 active:scale-98 transition-all"
          >
            <Wallet className="w-6 h-6" />
            <span className="text-lg font-bold text-on-surface">
              Set Budget
            </span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {monthBudget && monthBudget.totalBudget > 0 && (
          <GlassCard className="p-3">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-on-surface">
                Budget Progress
              </p>
              <p
                className={`text-xs font-semibold ${budgetPercentage >= 100 ? 'text-error' : 'text-tertiary'}`}
              >
                {budgetPercentage.toFixed(0)}% used
              </p>
            </div>
            <ProgressBar
              percentage={budgetPercentage}
              color="gradient"
              showGlow={budgetPercentage >= 80}
            />
          </GlassCard>
        )}

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-on-surface">Recent</h3>
          {isLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : invoices.length === 0 ? (
            <p className="text-slate-500 text-sm">No expenses this month.</p>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 8).map((inv) => (
                <div
                  key={inv.id}
                  className="glass-card flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {inv.note || inv.categoryName}
                      </p>
                      <p className="text-[10px] text-on-surface-variant opacity-60">
                        {inv.categoryName} •{' '}
                        {new Date(inv.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
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
      </Page>
    </div>
  )
}
