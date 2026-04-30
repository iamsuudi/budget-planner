import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import {
  useGetCategories,
  useCreateInvoice,
  useGetInvoicesByMonth,
  useGetWallets,
} from '#/hooks/query'
import { getActiveCurrency } from '#/lib/currency'
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
  const [currencyCC, setCurrencyCC] = useState('USD')
  const { currentMonth } = useMonth()
  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetCategories()
  const { data: wallets = [], isLoading: isLoadingWallets } = useGetWallets()
  const { data: invoices = [] } = useGetInvoicesByMonth(
    currentMonth.year,
    currentMonth.month,
    'expense',
  )
  const createInvoice = useCreateInvoice()

  const [amount, setAmount] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [note, setNote] = useState('')

  const isLoading = isLoadingCategories || isLoadingWallets

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const selectedWallet = selectedCategory
    ? wallets.find((w) => w.id === selectedCategory.walletId)
    : null

  const handleSave = () => {
    if (!amount || !selectedCategoryId) return

    const category = categories.find((c) => c.id === selectedCategoryId)
    if (!category) return

    createInvoice.mutate(
      {
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        categoryId: selectedCategoryId,
        categoryName: category.name,
        type: 'expense',
        note: note.trim() || undefined,
      },
      { onSuccess: () => navigate({ to: '/' }) },
    )
  }

  const isValid = useMemo(() => {
    return !!amount && parseFloat(amount) > 0 && selectedCategoryId
  }, [amount, selectedCategoryId])

  const recentAmount =
    invoices.length > 0 ? invoices.reduce((sum, inv) => sum + inv.amount, 0) : 0

  useEffect(() => {
    getActiveCurrency().then((c) => setCurrencyCC(c.cc))
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (categories.length === 0 || wallets.length === 0) {
    return (
      <div className="">
        <TopAppBar showBack backTo="/expense" />

        <Page
          title="Add Expense"
          description="Add a new expense to your budget."
        >
          {categories.length === 0 && (
            <div className="glass-panel rounded-xl p-6 mb-4">
              <p className="text-slate-400 mb-4">
                You need to create at least one expense category first.
              </p>
              <Link
                to="/expense/categories/add"
                className="text-secondary hover:underline"
              >
                Create Category
              </Link>
            </div>
          )}

          {wallets.length === 0 && (
            <div className="glass-panel rounded-xl p-6">
              <p className="text-slate-400 mb-4">
                You need to create at least one wallet first.
              </p>
              <Link
                to="/settings/wallets/add"
                className="text-secondary hover:underline"
              >
                Create Wallet
              </Link>
            </div>
          )}
        </Page>
      </div>
    )
  }

  const categoriesWithoutWallet = categories.filter((c) => !c.walletId)

  if (categoriesWithoutWallet.length > 0) {
    return (
      <div className="">
        <TopAppBar showBack backTo="/" />

        <Page className="space-y-6">
          <div className="glass-panel rounded-xl p-6 mb-4">
            <p className="text-slate-400 mb-4">
              Some categories don't have a wallet assigned yet. Please assign a
              wallet to all categories first.
            </p>
            <Link
              to="/expense/categories"
              className="text-secondary hover:underline"
            >
              Manage Categories
            </Link>
          </div>
        </Page>
      </div>
    )
  }

  return (
    <div className="">
      <TopAppBar showBack backTo="/" />

      <Page className="space-y-6">
        <div className="glass-panel rounded-xl p-4 space-y-4">
          <section className="space-y-2">
            <div className="space-y-2">
              <label className="text-sm text-violet-400">Amount</label>
              <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2 flex items-center">
                <span className="text-slate-500 mr-2">{currencyCC}</span>
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
              This month's spending: {currencyCC}
              {recentAmount.toFixed(2)}
            </p>
          )}

          <section className="space-y-2">
            <label className="text-sm text-violet-400">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(function () {
                return categories
              })()
                .filter((cat) => cat.walletId)
                .map((cat) => {
                  const wallet = wallets.find((w) => w.id === cat.walletId)
                  const isSelected = selectedCategoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      className={`p-3 rounded-lg border transition-all active:scale-95 ${
                        isSelected
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
                      <span className="text-xs block">{cat.name}</span>
                      {wallet && isSelected && (
                        <span className="text-xs text-slate-500 block truncate">
                          {wallet.name}
                        </span>
                      )}
                    </button>
                  )
                })}
            </div>
          </section>

          {selectedCategory && selectedWallet && (
            <section className="space-y-2">
              <label className="text-sm text-violet-400">Wallet</label>
              <div className="p-3 rounded-lg glass-panel text-slate-400 border border-transparent">
                <span className="text-sm">{selectedWallet.name}</span>
                <span className="text-xs text-slate-500 ml-2">
                  •••{selectedWallet.accountNumber.slice(-4)}
                </span>
              </div>
            </section>
          )}

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
