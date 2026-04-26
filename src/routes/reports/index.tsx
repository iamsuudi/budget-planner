import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useCurrency } from '#/lib/currency-context'
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

export const Route = createFileRoute('/reports/')({
  component: ReportsPage,
})

function ReportsPage() {
  const { formatAmount } = useCurrency()
  const { currentMonth } = useMonth()
  const { year, month } = currentMonth

  const { data: categories = [] } = useGetCategories()
  const { data: invoices = [] } = useGetInvoicesByMonth(year, month)
  const { data: monthBudget } = useGetMonthBudget(year, month)

  const totalExpenses = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.amount, 0)
  }, [invoices])

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
        description: `${formatAmount(used)} spent`,
        icon: cat.icon,
        used,
        total,
        percentage,
      }
    })
  }, [categories, categorySpending, monthBudget])

  const budgetPercentage = useMemo(() => {
    if (!monthBudget?.totalBudget || monthBudget.totalBudget === 0) return 0
    return Math.min((totalExpenses / monthBudget.totalBudget) * 100, 100)
  }, [totalExpenses, monthBudget])

  const remaining = (monthBudget?.totalBudget || 0) - totalExpenses

  return (
    <div className="">
      <TopAppBar showProfile={false} />

      <Page>
        <section className="mb-6">
          <CalendarNav />
        </section>

        <section className="mb-6">
          <GlassCard className="relative h-36 rounded-xl overflow-hidden glass-card p-4 flex items-end">
            <div className="relative z-10 w-full flex justify-between items-center">
              <div>
                <p className="text-[10px] text-primary uppercase tracking-widest">
                  Total Performance
                </p>
                <h4 className="text-2xl font-bold text-on-surface">
                  {budgetPercentage >= 100
                    ? 'Over Budget'
                    : budgetPercentage >= 80
                      ? 'Near Limit'
                      : 'On Track'}
                </h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-outline">Balance</p>
                <p
                  className={`text-lg font-bold ${
                    remaining >= 0 ? 'text-tertiary' : 'text-error'
                  }`}
                >
                  {remaining >= 0 ? '+' : ''}
                  {formatAmount(remaining)}
                </p>
              </div>
            </div>
          </GlassCard>
        </section>

        <div className="flex flex-col gap-3">
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
              No category budgets set. Set budgets in the Budget page.
            </p>
          )}
        </div>

        {monthBudget && monthBudget.totalBudget > 0 && (
          <section className="mt-6 bg-surface-container-lowest p-4 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base font-bold text-white mb-2">
                Budget Overview
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {totalExpenses > monthBudget.totalBudget ? (
                  <>
                    You&apos;ve exceeded your total budget by{' '}
                    <span className="text-error font-bold">
                      {formatAmount(totalExpenses - monthBudget.totalBudget)}
                    </span>
                  </>
                ) : (
                  <>
                    You have{' '}
                    <span className="text-tertiary font-bold">
                      {formatAmount(remaining)}
                    </span>{' '}
                    remaining this month.
                  </>
                )}
              </p>
              <div className="flex gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">
                    Budgeted
                  </span>
                  <span className="text-base font-bold text-green-500">
                    {formatAmount(monthBudget.totalBudget)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-4">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">
                    Spent
                  </span>
                  <span className="text-base font-bold text-red-500">
                    {formatAmount(totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </Page>
    </div>
  )
}
