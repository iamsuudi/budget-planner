import { createFileRoute, Link } from '@tanstack/react-router'
import { Wallet, Flag, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { formatCurrency } from '#/lib/currency'
import { useMonth } from '#/lib/month-context'
import {
  useGetCategories,
  useGetInvoicesByMonth,
  useGetMonthBudget,
} from '#/hooks/query'
import { CategoryCard } from '#/components/CategoryCard'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { CalendarNav } from '#/components/CalendarNav'
import { ProgressBar } from '#/components/ProgressBar'

export const Route = createFileRoute('/budget/')({
  component: BudgetPage,
})

function BudgetPage() {
  const { currentMonth } = useMonth()
  const { year, month } = currentMonth

  const { data: categories = [] } = useGetCategories()
  const { data: invoices = [] } = useGetInvoicesByMonth(year, month)
  const { data: monthBudget } = useGetMonthBudget(year, month)

  const totalExpenses = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.amount, 0)
  }, [invoices])

  const budgetPercentage = useMemo(() => {
    if (!monthBudget?.totalBudget || monthBudget.totalBudget === 0) return 0
    return Math.min((totalExpenses / monthBudget.totalBudget) * 100, 100)
  }, [totalExpenses, monthBudget])

  const netAmount = (monthBudget?.totalBudget || 0) - totalExpenses

  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {}
    invoices.forEach((inv) => {
      if (!spending[inv.categoryId]) spending[inv.categoryId] = 0
      spending[inv.categoryId] += inv.amount
    })
    return spending
  }, [invoices])

  const categoryData = useMemo(() => {
    return categories.map((cat) => {
      const used = categorySpending[cat.id] || 0
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const total = monthBudget?.categoryBudgets?.[cat.id] || 0
      const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0
      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        used,
        total,
        percentage,
      }
    })
  }, [categories, categorySpending, monthBudget])

  return (
    <div className="">
      <TopAppBar showProfile />

      <Page
        title="Budget"
        description="Set and track your budget for the current month."
      >
        <CalendarNav />

        <GlassCard className="p-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-secondary/20 blur-[60px] rounded-full" />
          <div className="relative z-10 mt-10">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
                  <Flag className="w-5 h-5 text-secondary" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Budget
                </p>
                <p className="text-lg font-bold text-on-surface">
                  {formatCurrency(monthBudget?.totalBudget || 0)}
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingDown className="w-5 h-5 text-error" />
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Expenses
                </p>
                <p className="text-lg font-bold text-on-surface">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${netAmount >= 0 ? 'bg-tertiary/10' : 'bg-error/10'}`}
                >
                  {netAmount >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-tertiary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-error" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Net
                </p>
                <p
                  className={`text-lg font-bold ${netAmount >= 0 ? 'text-tertiary' : 'text-error'}`}
                >
                  {formatCurrency(netAmount)}
                </p>
              </div>
            </div>

            {monthBudget && monthBudget.totalBudget > 0 && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-on-surface">
                    Budget Progress
                  </p>
                  <p
                    className={`text-xs font-semibold ${budgetPercentage >= 100 ? 'text-error' : 'text-tertiary'}`}
                  >
                    {budgetPercentage.toFixed(1)}% used
                  </p>
                </div>
                <ProgressBar
                  percentage={budgetPercentage}
                  color="gradient"
                  showGlow={budgetPercentage >= 80}
                />
              </>
            )}
          </div>
          {monthBudget && monthBudget.totalBudget > 0 && (
            <span
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${budgetPercentage >= 100 ? 'bg-error/10 text-error' : 'bg-tertiary/10 text-tertiary'}`}
            >
              {budgetPercentage >= 100
                ? 'Over'
                : budgetPercentage >= 80
                  ? 'Near'
                  : 'On Track'}
            </span>
          )}
        </GlassCard>

        <Link
          to="/budget/edit"
          className="w-full border border-secondary text-secondary rounded-xl py-3 px-5 flex gap-2 items-center justify-center hover:bg-secondary/10 active:scale-98 transition-all"
        >
          <Wallet className="w-5 h-5" />
          <span className="text-lg font-bold text-on-surface">Set Budget</span>
        </Link>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-on-surface">By Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-slate-500 text-sm">No categories yet.</p>
          ) : categoryData.some((cat) => cat.total > 0) ? (
            categoryData
              .filter((cat) => cat.total > 0)
              .map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
          ) : (
            <p className="text-slate-500 text-sm">
              No category budgets set. Tap "Set Budget" to allocate budgets.
            </p>
          )}
        </section>
      </Page>
    </div>
  )
}
