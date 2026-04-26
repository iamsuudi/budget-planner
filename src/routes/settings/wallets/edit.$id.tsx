import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  useGetWalletById,
  useUpdateWallet,
  useDeleteWallet,
} from '#/hooks/query'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { CancelButton } from '#/components/CancelButton'

export const Route = createFileRoute('/settings/wallets/edit/$id')({
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
      { onSuccess: () => navigate({ to: '/settings/wallets' }) },
    )
  }

  const handleDelete = () => {
    deleteWallet.mutate(id, {
      onSuccess: () => navigate({ to: '/settings/wallets' }),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dim text-on-background antialiased">
        <TopAppBar title="Edit Wallet" showBack backTo={'/settingswallets'} />
        <Page>
          <p className="text-slate-400">Loading...</p>
        </Page>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar title="Edit Wallet" showBack backTo={'/settings/wallets'} />

      <Page className="min-h-screen">
        <section className="flex flex-col gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Wallet Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chase"
                className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={
              updateWallet.isPending || !name.trim() || !accountNumber.trim()
            }
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold py-3 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {updateWallet.isPending ? 'Saving...' : 'Save Changes'}
          </button>

          <CancelButton to="/settings/wallets" />

          <button
            onClick={handleDelete}
            className="w-full bg-error-container/20 text-error font-semibold py-3 rounded-xl transition-all active:scale-98 text-sm"
          >
            Delete Wallet
          </button>
        </section>
      </Page>
    </div>
  )
}
