import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreateWallet } from '#/hooks/query'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/settings/wallets/add')({
  component: AddWalletPage,
})

function AddWalletPage() {
  const navigate = useNavigate()
  const createWallet = useCreateWallet()
  const [name, setName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  const handleSave = () => {
    if (!name.trim() || !accountNumber.trim()) return

    createWallet.mutate(
      { name: name.trim(), accountNumber: accountNumber.trim() },
      { onSuccess: () => navigate({ to: '/settings/wallets' }) },
    )
  }

  return (
    <div className="">
      <TopAppBar showBack backTo={'/settings/wallets'} />

      <Page
        title="Add Wallet"
        description="Create a new wallet by entering its name and account number."
      >
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
              createWallet.isPending || !name.trim() || !accountNumber.trim()
            }
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold py-3 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {createWallet.isPending ? 'Adding...' : 'Add Wallet'}
          </button>
        </section>
      </Page>
    </div>
  )
}
