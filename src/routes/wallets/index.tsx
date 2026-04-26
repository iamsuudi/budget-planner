import { createFileRoute, Link } from '@tanstack/react-router'
import { Building2, Trash2 } from 'lucide-react'
import { useGetWallets, useDeleteWallet } from '#/hooks/query'
import { ActionListItem } from '#/components/ActionListItem'
import { BottomNavBar } from '#/components/BottomNavBar'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { Icon } from '#/components/Icon'

export const Route = createFileRoute('/wallets/')({
  component: WalletsPage,
})

function WalletsPage() {
  const { data: wallets = [], isLoading } = useGetWallets()
  const deleteWallet = useDeleteWallet()

  const handleDelete = (id: string) => {
    if (confirm('Delete this wallet?')) {
      deleteWallet.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar title="My Wallets" showBack backTo={'/profile'} />

      <Page className="min-h-screen">
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              Bank Accounts ({wallets.length})
            </h2>
            <Link
              to="/wallets/add"
              className="text-violet-400 text-sm font-medium hover:text-violet-300"
            >
              + Add
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : wallets.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No wallets yet</p>
              <Link
                to="/wallets/add"
                className="text-violet-400 text-sm font-medium mt-2 inline-block"
              >
                Add your first wallet
              </Link>
            </GlassCard>
          ) : (
            wallets.map((wallet) => (
              <div key={wallet.id} className="relative group">
                <Link
                  to={`/wallets/edit/$id`}
                  params={{ id: wallet.id.toString() }}
                  className="block"
                >
                  <ActionListItem
                    icon="account_balance"
                    iconBg="bg-violet-500/20"
                    iconColor="text-violet-400"
                    title={wallet.name}
                    description={`****${wallet.accountNumber.slice(-4)}`}
                  />
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(wallet.id)
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </section>
      </Page>

      <BottomNavBar />
    </div>
  )
}