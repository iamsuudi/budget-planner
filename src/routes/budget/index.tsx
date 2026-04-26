import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { Icon } from '#/components/Icon'

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
  const [categoryBudgets, setCategoryBudgets] = useState<
    Record<string, string>
  >(() => {
    const savedCategoryBudgets = monthBudget?.categoryBudgets || {}
    const initial: Record<string, string> = {}
    categories.forEach((cat) => {
      initial[cat.id] = savedCategoryBudgets[cat.id].toString() || ''
    })
    return initial
  })

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

      <Page>
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Link
              to="/"
              className="text-secondary hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevMonth}
                className="p-1 text-slate-500 hover:text-secondary"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-semibold">
                {monthName} {year}
              </span>
              <button
                onClick={goToNextMonth}
                className="p-1 text-slate-500 hover:text-secondary"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Set Budget</h1>
          <p className="text-slate-400 text-sm mt-1">
            Set monthly budget for this month
          </p>
        </header>

        <div className="glass-panel rounded-xl p-4 space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm text-violet-400">
              Total Monthly Budget
            </label>
            <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2 flex items-center">
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
          <h2 className="text-base font-semibold text-white mb-3">
            Category Budgets
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            Optional per-category budgets.
          </p>

          {categories.length === 0 ? (
            <p className="text-slate-500 text-sm">No categories yet.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => {
                const style = getIconStyle(cat.icon)
                const spent = categorySpending[cat.id] || 0
                const budget = parseFloat(categoryBudgets[cat.id]) || 0
                const remaining = budget - spent

                return (
                  <div key={cat.id} className="glass-card rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`${style.bg} p-1.5 rounded-lg border ${style.border}`}
                      >
                        <Icon name={cat.icon} className={style.color} size={18} />
                      </div>
                      <span className="text-white font-semibold text-sm">
                        {cat.name}
                      </span>
                      {budget > 0 && (
                        <span
                          className={`ml-auto text-xs ${remaining >= 0 ? 'text-tertiary' : 'text-error'}`}
                        >
                          {formatAmount(remaining)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">
                        {getSymbol()}
                      </span>
                      <input
                        className="bg-transparent border-b border-slate-700 focus:border-secondary text-white text-sm w-full pb-1"
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
                      <p className="text-[10px] text-slate-500 mt-1">
                        Spent: {formatAmount(spent)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={setMonthBudget.isPending}
            className="py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-98 transition-transform disabled:opacity-50"
          >
            {setMonthBudget.isPending ? 'Saving...' : 'Save Budget'}
          </button>
          <Link
            to="/"
            className="py-3 border border-secondary text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/5 transition-all active:scale-98 text-center"
          >
            Cancel
          </Link>
        </div>

        <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -z-10" />
        <div className="fixed -top-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />
      </Page>
    </div>
  )
}
