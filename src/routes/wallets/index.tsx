import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { TopAppBar, ActionListItem, GlassCard, BottomNavBar } from '../../components/ui'
import { getAllWallets, deleteWallet } from '../../lib/storage'
import type { Wallet } from '../../types/wallet'

export const Route = createFileRoute('/wallets/')({
  component: WalletsPage,
})

const navItems = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'account_circle', label: 'Profile', to: '/profile' },
  { icon: 'settings', label: 'Settings', to: '/settings' },
]

function WalletsPage() {
  const navigate = useNavigate()
  const [wallets, setWallets] = useState<Wallet[]>([])

  useEffect(() => {
    getAllWallets().then(setWallets)
  }, [])

  const handleDelete = async (id: string) => {
    await deleteWallet(id)
    setWallets(wallets.filter(w => w.id !== id))
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar 
        title="My Wallets"
        showBack
        onBack={() => navigate({ to: '/profile' })}
      />
      
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest px-2">
              Bank Accounts ({wallets.length})
            </h2>
            <Link 
              to="/wallets/add"
              className="text-violet-400 text-sm font-medium hover:text-violet-300"
            >
              + Add
            </Link>
          </div>
          
          {wallets.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-500 mb-2"> account_balance </span>
              <p className="text-slate-400">No wallets yet</p>
              <Link 
                to="/wallets/add"
                className="text-violet-400 text-sm font-medium mt-2 inline-block"
              >
                Add your first wallet
              </Link>
            </GlassCard>
          ) : (
            wallets.map(wallet => (
              <Link key={wallet.id} to={`/wallets/edit/${wallet.id}`}>
                <ActionListItem
                  icon="account_balance"
                  iconBg="bg-violet-500/20"
                  iconColor="text-violet-400"
                  title={wallet.name}
                  description={`****${wallet.accountNumber.slice(-4)}`}
                />
              </Link>
            ))
          )}
        </section>
      </main>

      <BottomNavBar items={navItems} />
    </div>
  )
}