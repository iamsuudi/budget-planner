import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { TopAppBar, GlassCard, ActionListItem } from '../../components/ui'
import { getWalletById, updateWallet, deleteWallet } from '../../lib/storage'
import type { Wallet } from '../../types/wallet'

export const Route = createFileRoute('/wallets/edit/$id')({
  component: EditWalletPage,
})

function EditWalletPage() {
  const navigate = useNavigate()
  const { id } = Route.useParams()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [name, setName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getWalletById(id).then(w => {
      if (w) {
        setWallet(w)
        setName(w.name)
        setAccountNumber(w.accountNumber)
      }
    })
  }, [id])

  const handleSave = async () => {
    if (!name.trim() || !accountNumber.trim()) return
    
    setSaving(true)
    await updateWallet(id, {
      name: name.trim(),
      accountNumber: accountNumber.trim(),
    })
    setSaving(false)
    navigate({ to: '/wallets' })
  }

  const handleDelete = async () => {
    await deleteWallet(id)
    navigate({ to: '/wallets' })
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-surface-dim text-on-background antialiased">
        <TopAppBar title="Edit Wallet" showBack onBack={() => navigate({ to: '/wallets' })} />
        <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
          <p className="text-slate-400">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar 
        title="Edit Wallet"
        showBack
        onBack={() => navigate({ to: '/wallets' })}
      />
      
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
        <section className="flex flex-col gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Wallet Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Chase Savings"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Account Number</label>
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
            disabled={saving || !name.trim() || !accountNumber.trim()}
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
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