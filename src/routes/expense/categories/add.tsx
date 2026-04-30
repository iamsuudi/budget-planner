import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreateCategory, useGetWallets } from '#/hooks/query'
import { AVAILABLE_ICONS, getIconStyle } from '#/lib/icons'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { Icon } from '#/components/Icon'
import { CancelButton } from '#/components/CancelButton'
import { GlassCard } from '#/components/GlassCard'
import { Wallet, PlusCircle } from 'lucide-react'

export const Route = createFileRoute('/expense/categories/add')({
  component: AddCategoryPage,
})

function AddCategoryPage() {
  const navigate = useNavigate()
  const createCategory = useCreateCategory()
  const { data: wallets = [] } = useGetWallets()
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('restaurant')
  const [selectedWalletId, setSelectedWalletId] = useState('')

  const handleSave = () => {
    if (!name.trim() || !selectedWalletId) return

    createCategory.mutate(
      { name: name.trim(), icon: selectedIcon, walletId: selectedWalletId },
      { onSuccess: () => navigate({ to: '/expense/categories' }) },
    )
  }

  const isValid = name.trim() && selectedWalletId

  const hasWallets = wallets.length > 0

  return (
    <div className="">
      <TopAppBar showBack backTo="/expense/categories" />

      <Page title="Add Category" description="Create a new expense category.">
        {!hasWallets ? (
          <GlassCard className="flex flex-col items-center justify-center gap-2 p-6">
            <Wallet className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h2 className="">No wallets yet</h2>
            <p className="text-slate-400 text-sm text-center max-w-80">
              You haven't created any wallets yet. Get started by creating your
              first wallet.
            </p>
            <Link
              to="/settings/wallets/add"
              className="w-fit bg-primary-container text-on-primary-container py-2 px-6 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add
            </Link>
          </GlassCard>
        ) : (
          <>
            <div className="glass-panel rounded-xl p-4 space-y-4">
              <section className="space-y-2">
                <div className="space-y-2">
                  <label className="text-sm text-violet-400">
                    Category Name
                  </label>
                  <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2">
                    <input
                      className="bg-transparent border-none focus:ring-0 focus:outline-0 w-full text-white placeholder-slate-600 text-base"
                      placeholder="e.g., Food"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-sm text-violet-400">Wallet</label>
                <div className="flex flex-col gap-2">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      className={`p-3 rounded-lg border flex items-center justify-between transition-all active:scale-95 text-sm ${
                        selectedWalletId === wallet.id
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                          : 'glass-panel hover:bg-white/10 text-slate-400 border-transparent'
                      }`}
                      onClick={() => setSelectedWalletId(wallet.id)}
                    >
                      <span>{wallet.name}</span>
                      <span className="text-xs text-slate-500">
                        •••{wallet.accountNumber.slice(-4)}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-violet-400">Icon</label>
                  <span className="text-xs text-slate-500 capitalize">
                    {selectedIcon}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {AVAILABLE_ICONS.map((icon) => {
                    const styles = getIconStyle(icon)
                    return (
                      <button
                        key={icon}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                          selectedIcon === icon
                            ? `${styles.bg} border ${styles.border} ${styles.color} electric-glow`
                            : 'glass-panel hover:bg-white/10 text-slate-400 border border-transparent'
                        }`}
                        onClick={() => setSelectedIcon(icon)}
                      >
                        <Icon name={icon} className="w-5 h-5" size={20} />
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={!isValid || createCategory.isPending}
                className="py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createCategory.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <CancelButton to="/expense/categories" />
            </div>

            <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -z-10" />
            <div className="fixed -top-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />
          </>
        )}
      </Page>
    </div>
  )
}
