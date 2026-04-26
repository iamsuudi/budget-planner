import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  useGetMonthBudget,
  useSetMonthBudget,
  useGetCategories,
  useGetInvoicesByMonth,
} from '#/hooks/query'
import { getIconStyle } from '#/lib/icons'
import { useMonth } from '#/lib/month-context'
import { useCurrency } from '#/lib/currency-context'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/budget/')({
  component: BudgetPage,
})

function BudgetPage() {
  const navigate = useNavigate()
  const { currentMonth, goToPrevMonth, goToNextMonth } = useMonth()
  const { formatAmount, getSymbol } = useCurrency()
  const { year, month, monthName } = currentMonth

  const { data: categories = [] } = useGetCategories()
  const { data: monthBudget } = useGetMonthBudget(year, month)
  const { data: invoices = [] } = useGetInvoicesByMonth(year, month)
  const setMonthBudget = useSetMonthBudget()

  const [totalBudgetInput, setTotalBudgetInput] = useState(
    monthBudget?.totalBudget.toString() || '',
  )
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>(
    () => {
      const savedCategoryBudgets = monthBudget?.categoryBudgets || {}
      const initial: Record<string, string> = {}
      categories.forEach((cat) => {
        initial[cat.id] = savedCategoryBudgets[cat.id]?.toString() || ''
      })
      return initial
    },
  )

  const categorySpending = useMemo(() => {
    const spending: Record<string, number> = {}
    invoices.forEach((inv) => {
      if (!spending[inv.categoryId]) spending[inv.categoryId] = 0
      spending[inv.categoryId] += inv.amount
    })
    return spending
  }, [invoices])

  const handleSave = () => {
    const total = parseFloat(totalBudgetInput) || 0
    const catBudgets: Record<string, number> = {}

    Object.entries(categoryBudgets).forEach(([id, value]) => {
      if (value) catBudgets[id] = parseFloat(value)
    })

    setMonthBudget.mutate(
      {
        monthId: String(month),
        year,
        number: month,
        totalBudget: total,
        categoryBudgets: catBudgets,
      },
      { onSuccess: () => navigate({ to: '/' }) },
    )
  }

  return (
    <div className="">
      <TopAppBar />

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/"
              className="text-secondary material-symbols-outlined hover:text-cyan-400 transition-colors"
            >
              arrow_back
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className="p-2 text-slate-500 hover:text-secondary"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-white font-semibold">
                {monthName} {year}
              </span>
              <button
                onClick={goToNextMonth}
                className="p-2 text-slate-500 hover:text-secondary"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Set Budget</h1>
          <p className="text-slate-400 mt-2">
            Set monthly budget for this month
          </p>
        </header>

        <div className="glass-panel rounded-xl p-6 space-y-6 mb-6">
          <div className="space-y-2">
            <label className="text-sm text-violet-400">
              Total Monthly Budget
            </label>
            <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-4 py-3 flex items-center">
              <span className="text-slate-500 mr-2">{getSymbol()}</span>
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                value={totalBudgetInput}
                onChange={(e) => setTotalBudgetInput(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Category Budgets (Optional)
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Set specific budgets for each category.
          </p>

          {categories.length === 0 ? (
            <p className="text-slate-500">No categories created yet.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => {
                const style = getIconStyle(cat.icon)
                const spent = categorySpending[cat.id] || 0
                const budget = parseFloat(categoryBudgets[cat.id]) || 0
                const remaining = budget - spent

                return (
                  <div key={cat.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`${style.bg} p-2 rounded-lg border ${style.border}`}
                      >
                        <span
                          className={`material-symbols-outlined ${style.color}`}
                        >
                          {cat.icon}
                        </span>
                      </div>
                      <span className="text-white font-semibold">
                        {cat.name}
                      </span>
                      {budget > 0 && (
                        <span
                          className={`ml-auto text-sm ${remaining >= 0 ? 'text-tertiary' : 'text-error'}`}
                        >
                          {formatAmount(remaining)} left
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-sm">
                        {getSymbol()}
                      </span>
                      <input
                        className="bg-transparent border-b border-slate-700 focus:border-secondary text-white w-full pb-1"
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        min="0"
                        value={categoryBudgets[cat.id]}
                        onChange={(e) =>
                          setCategoryBudgets((prev) => ({
                            ...prev,
                            [cat.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    {spent > 0 && (
                      <p className="text-xs text-slate-500 mt-2">
                        Spent: ${spent.toFixed(2)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={setMonthBudget.isPending}
            className="px-10 py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50"
          >
            {setMonthBudget.isPending ? 'Saving...' : 'Save Budget'}
          </button>
          <Link
            to="/"
            className="px-10 py-3 border border-secondary text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/5 transition-all active:scale-95 text-center"
          >
            Cancel
          </Link>
        </div>

        <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] -z-10" />
        <div className="fixed -top-32 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10" />
      </main>
    </div>
  )
}