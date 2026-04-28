import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  useGetInvoiceById,
  useUpdateInvoice,
  useDeleteInvoice,
  useGetSalaryCategories,
  useGetWallets,
} from '#/hooks/query'
import { getActiveCurrency } from '#/lib/currency'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { Icon } from '#/components/Icon'
import { CancelButton } from '#/components/CancelButton'

export const Route = createFileRoute('/salary/transactions/edit/$id')({
  component: EditSalaryTransactionPage,
})

function EditSalaryTransactionPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: invoice, isLoading } = useGetInvoiceById(id)
  const { data: categories = [] } = useGetSalaryCategories()
  const { data: wallets = [] } = useGetWallets()
  const updateInvoice = useUpdateInvoice()
  const deleteInvoice = useDeleteInvoice()

  const [currencyCC, setCurrencyCC] = useState('USD')
  const [amount, setAmount] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    getActiveCurrency().then((c) => setCurrencyCC(c.cc))
  }, [])

  useEffect(() => {
    if (invoice) {
      setAmount(invoice.amount.toString())
      setSelectedCategoryId(invoice.categoryId)
      setNote(invoice.note || '')
      setDate(new Date(invoice.date).toISOString().split('T')[0])
    }
  }, [invoice])

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const selectedWallet = selectedCategory
    ? wallets.find((w) => w.id === selectedCategory.walletId)
    : null

  const handleSave = () => {
    if (!amount || !selectedCategoryId || !date || !id) return

    updateInvoice.mutate(
      {
        id,
        updates: {
          amount: parseFloat(amount),
          categoryId: selectedCategoryId,
          categoryName: selectedCategory?.name || '',
          note: note.trim() || undefined,
          date: new Date(date).toISOString(),
        },
      },
      { onSuccess: () => navigate({ to: '/salary/transactions' }) },
    )
  }

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    deleteInvoice.mutate(id, {
      onSuccess: () => navigate({ to: '/salary/transactions' }),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="">
        <TopAppBar showBack backTo="/salary/transactions" />
        <Page title="Edit Transaction">
          <p className="text-slate-500">Transaction not found.</p>
        </Page>
      </div>
    )
  }

  return (
    <div className="">
      <TopAppBar showBack backTo="/salary/transactions" />

      <Page title="Edit Salary" description="Update this salary transaction.">
        <div className="glass-panel rounded-xl p-4 space-y-4">
          <section className="space-y-2">
            <label className="text-sm text-violet-400">Amount</label>
            <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2 flex items-center">
              <span className="text-slate-500 mr-2">{currencyCC}</span>
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-0 w-full text-white placeholder-slate-600 text-base"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-2">
            <label className="text-sm text-violet-400">Date</label>
            <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2">
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-2">
            <label className="text-sm text-violet-400">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const wallet = wallets.find((w) => w.id === cat.walletId)
                const isSelected = selectedCategoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    className={`p-3 rounded-lg border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-tertiary/20 border-tertiary/50 text-tertiary electric-glow'
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
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={
              !amount || !selectedCategoryId || !date || updateInvoice.isPending
            }
            className="w-full py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateInvoice.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <CancelButton to="/salary/transactions" />
          <button
            onClick={handleDelete}
            disabled={deleteInvoice.isPending}
            className="py-3 bg-error-container text-error rounded-xl text-sm font-semibold hover:bg-error/10 transition-all active:scale-95"
          >
            {deleteInvoice.isPending ? 'Deleting...' : 'Delete Transaction'}
          </button>
        </div>
      </Page>
    </div>
  )
}
