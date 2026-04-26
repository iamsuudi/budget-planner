import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { TopAppBar, GlassCard, ActionListItem } from '../../components/ui'
import { addWallet } from '../../lib/storage'

export const Route = createFileRoute('/wallets/add')({
  component: AddWalletPage,
})

function AddWalletPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !accountNumber.trim()) return
    
    setSaving(true)
    await addWallet({
      name: name.trim(),
      accountNumber: accountNumber.trim(),
    })
    setSaving(false)
    navigate({ to: '/wallets' })
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar 
        title="Add Wallet"
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
            {saving ? 'Adding...' : 'Add Wallet'}
          </button>
        </section>
      </main>
    </div>
  )
}