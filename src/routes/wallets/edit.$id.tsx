import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  useGetWalletById,
  useUpdateWallet,
  useDeleteWallet,
} from '#/hooks/query'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/wallets/edit/$id')({
  component: EditWalletPage,
})

function EditWalletPage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const { data: wallet, isLoading } = useGetWalletById(id)
  const updateWallet = useUpdateWallet()
  const deleteWallet = useDeleteWallet()
  const [name, setName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  useEffect(() => {
    if (wallet) {
      setName(wallet.name)
      setAccountNumber(wallet.accountNumber)
    }
  }, [wallet])

  const handleSave = () => {
    if (!name.trim() || !accountNumber.trim()) return

    updateWallet.mutate(
      {
        id,
        updates: { name: name.trim(), accountNumber: accountNumber.trim() },
      },
      { onSuccess: () => navigate({ to: '/wallets' }) },
    )
  }

  const handleDelete = () => {
    deleteWallet.mutate(id, { onSuccess: () => navigate({ to: '/wallets' }) })
  }

  if (isLoading) {
    return (
      <div className="">
        <TopAppBar title="Edit Wallet" showBack backTo={'/wallets'} />
        <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="">
      <TopAppBar title="Edit Wallet" showBack backTo={'/wallets'} />

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
        <section className="flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Wallet Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chase Savings"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={
              updateWallet.isPending || !name.trim() || !accountNumber.trim()
            }
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateWallet.isPending ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={handleDelete}
            className="w-full bg-error-container/20 text-error font-semibold py-4 rounded-xl transition-all active:scale-[0.98]"
          >
            Delete Wallet
          </button>
        </section>
      </main>
    </div>
  )
}
