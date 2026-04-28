import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { FolderPlus, PlusCircle } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import {
  useGetSalaryCategories,
  useCreateInvoice,
  useGetInvoicesByType,
  useGetWallets,
} from '#/hooks/query'
import { getIconStyle } from '#/lib/icons'
import { formatCurrency, getActiveCurrency } from '#/lib/currency'
import { useMonth } from '#/lib/month-context'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { CalendarNav } from '#/components/CalendarNav'
import { Icon } from '#/components/Icon'

export const Route = createFileRoute('/salary/')({
  component: SalaryPage,
})

function SalaryPage() {
  const navigate = useNavigate()
  const [currencyCC, setCurrencyCC] = useState('USD')
  const { currentMonth, isCurrentMonth } = useMonth()
  const { year, month } = currentMonth
  const { data: categories = [], isLoading: isLoadingCategories } =
    useGetSalaryCategories()
  const { data: wallets = [], isLoading: isLoadingWallets } = useGetWallets()
  const { data: invoices = [] } = useGetInvoicesByType('salary', year, month)
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
        type: 'salary',
        note: note.trim() || undefined,
      },
      { onSuccess: () => navigate({ to: '/salary' }) },
    )
  }

  const isValid = useMemo(() => {
    return !!amount && parseFloat(amount) > 0 && selectedCategoryId
  }, [amount, selectedCategoryId])

  const totalSalary =
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
        <TopAppBar />

        <Page
          title="Salary"
          description="Manage your salary categories and invoices."
        >
          {categories.length === 0 && (
            <div className="glass-panel rounded-xl p-6 mb-4">
              <p className="text-slate-400 mb-4">
                You need to create at least one salary category first.
              </p>
              <Link
                to="/salary/categories/add"
                className="text-secondary hover:underline"
              >
                Create Salary Category
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
        <TopAppBar title="Salary" showBack backTo="/" />

        <Page className="space-y-6">
          <div className="glass-panel rounded-xl p-6 mb-4">
            <p className="text-slate-400 mb-4">
              Some salary categories don't have a wallet assigned yet. Please
              assign a wallet to all categories first.
            </p>
            <Link
              to="/salary/categories"
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
      <TopAppBar title="Salary" showProfile />

      <Page className="space-y-6">
        <CalendarNav />

        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-tertiary/20 blur-[60px] rounded-full" />
          <div className="relative z-10 text-center">
            <p className="text-xs font-semibold text-on-surface-variant opacity-70 mb-2">
              Total Salary
            </p>
            <h1 className="text-4xl font-extrabold text-on-surface tracking-tight">
              {formatCurrency(totalSalary)}
            </h1>
          </div>
        </GlassCard>

        <div className="flex items-center justify-between gap-3">
          <Link
            to="/salary/add"
            className="border border-tertiary rounded-lg py-2 px-4 flex gap-2 items-center justify-center bg-tertiary/10 active:scale-98 transition-all"
          >
            <PlusCircle className="w-5 h-5 text-tertiary" />
            <span className="font-bold text-tertiary">Catagories</span>
          </Link>
          <Link
            to="/salary/categories"
            className="border border-primary-container rounded-lg py-2 px-4 flex gap-2 items-center justify-center bg-primary-container/10 active:scale-98 transition-all"
          >
            <FolderPlus className="w-5 h-5 text-primary-container" />
            <span className="font-bold text-primary-container">Add Salary</span>
          </Link>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-on-surface">Recent</h3>
            <Link
              to="/salary/transactions"
              className="text-xs text-tertiary hover:text-cyan-400 transition-colors"
            >
              View all
            </Link>
          </div>
          {invoices.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No salary entries this month.
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.slice(0, 8).map((inv) => {
                const category = categories.find((c) => c.id === inv.categoryId)
                const wallet = category
                  ? wallets.find((w) => w.id === category.walletId)
                  : null
                const style = getIconStyle(category?.icon || 'briefcase')
                return (
                  <div
                    key={inv.id}
                    className="glass-card flex items-center justify-between p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${style.bg} flex items-center justify-center ${style.color}`}
                      >
                        <Icon name={category?.icon || 'briefcase'} size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {inv.note || category?.name || inv.categoryName}
                        </p>
                        <p className="text-[10px] text-on-surface-variant opacity-60">
                          {category?.name || inv.categoryName}
                          {wallet ? ` • ${wallet.name}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-tertiary">
                        +{currencyCC}
                        {inv.amount.toFixed(2)}
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
