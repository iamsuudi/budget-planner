import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CreditCard } from 'lucide-react'
import { useState, useMemo } from 'react'
import {
  useGetCategories,
  useGetPaymentMethods,
  useCreateInvoice,
  useGetInvoicesByMonth,
} from '#/hooks/query'
import { useCurrency } from '#/lib/currency-context'
import { useMonth } from '#/lib/month-context'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { Icon } from '#/components/Icon'
import { CancelButton } from '#/components/CancelButton'

export const Route = createFileRoute('/expense/add')({
  component: AddExpensePage,
})

function AddExpensePage() {
  const navigate = useNavigate()
  const { getSymbol } = useCurrency()
  const { currentMonth } = useMonth()
  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetCategories()
  const { data: paymentMethods = [], isLoading: isLoadingPaymentMethods } =
    useGetPaymentMethods()
  const { data: invoices = [] } = useGetInvoicesByMonth(
    currentMonth.year,
    currentMonth.month,
  )
  const createInvoice = useCreateInvoice()

  const [amount, setAmount] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('')
  const [note, setNote] = useState('')

  const isLoading = isLoadingCategories || isLoadingPaymentMethods

  const handleSave = () => {
    if (!amount || !selectedCategoryId || !selectedPaymentMethodId) return

    const category = categories.find((c) => c.id === selectedCategoryId)
    const paymentMethod = paymentMethods.find(
      (pm) => pm.id === selectedPaymentMethodId,
    )
    if (!category || !paymentMethod) return

    createInvoice.mutate(
      {
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        categoryId: selectedCategoryId,
        categoryName: category.name,
        paymentMethodId: selectedPaymentMethodId,
        paymentMethodName: paymentMethod.name,
        note: note.trim() || undefined,
      },
      { onSuccess: () => navigate({ to: '/' }) },
    )
  }

  const isValid = useMemo(() => {
    return (
      !!amount &&
      parseFloat(amount) > 0 &&
      selectedCategoryId &&
      selectedPaymentMethodId
    )
  }, [amount, selectedCategoryId, selectedPaymentMethodId])

  const recentAmount =
    invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.amount, 0) : 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (categories.length === 0 || paymentMethods.length === 0) {
    return (
      <div className="">
        <TopAppBar title="Add Expense" showBack backTo="/" />

        <Page className="space-y-6">
          {categories.length === 0 && (
            <div className="glass-panel rounded-xl p-6 mb-4">
              <p className="text-slate-400 mb-4">
                You need to create at least one expense category first.
              </p>
              <Link
                to="/settings/expense-category/add"
                className="text-secondary hover:underline"
              >
                Create Category
              </Link>
            </div>
          )}

          {paymentMethods.length === 0 && (
            <div className="glass-panel rounded-xl p-6">
              <p className="text-slate-400 mb-4">
                You need to create at least one payment method first.
              </p>
              <Link
                to="/settings/payment-method/add"
                className="text-secondary hover:underline"
              >
                Create Payment Method
              </Link>
            </div>
          )}
        </Page>
      </div>
    )
  }

  return (
    <div className="">
      <TopAppBar title="Add Expense" showBack backTo="/" />

      <Page className="space-y-6">
        <div className="glass-panel rounded-xl p-4 space-y-4">
          <section className="space-y-2">
            <div className="space-y-2">
              <label className="text-sm text-violet-400">Amount</label>
              <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2 flex items-center">
                <span className="text-slate-500 mr-2">{getSymbol()}</span>
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </section>

          {recentAmount > 0 && (
            <p className="text-xs text-slate-500 text-center">
              This month's spending: {getSymbol()}
              {recentAmount.toFixed(2)}
            </p>
          )}

          <section className="space-y-2">
            <label className="text-sm text-violet-400">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`p-3 rounded-lg border transition-all active:scale-95 ${
                    selectedCategoryId === cat.id
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-400 electric-glow'
                      : 'glass-panel hover:bg-white/10 text-slate-400 border-transparent'
                  }`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  <Icon
                    name={cat.icon}
                    className="w-5 h-5 mb-1 block"
                    size={20}
                  />
                  <span className="text-xs">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <label className="text-sm text-violet-400">Payment Method</label>
            <div className="flex flex-col gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  className={`p-3 rounded-lg border flex items-center gap-2 transition-all active:scale-95 text-sm ${
                    selectedPaymentMethodId === pm.id
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                      : 'glass-panel hover:bg-white/10 text-slate-400 border-transparent'
                  }`}
                  onClick={() => setSelectedPaymentMethodId(pm.id)}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{pm.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <div className="space-y-2">
              <label className="text-sm text-violet-400">Note (Optional)</label>
              <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2">
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                  placeholder="Add a note..."
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={!isValid || createInvoice.isPending}
            className="w-full py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createInvoice.isPending ? 'Saving...' : 'Save Expense'}
          </button>
          <CancelButton to="/" />
        </div>

        <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -z-10" />
        <div className="fixed -top-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />
      </Page>
    </div>
  )
}
