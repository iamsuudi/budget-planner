import { createFileRoute, Link } from '@tanstack/react-router'
import { useGetWallets, useDeleteWallet } from '#/hooks/query'
import { ActionListItem } from '#/components/ActionListItem'
import { BottomNavBar } from '#/components/BottomNavBar'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

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
              <span className="material-symbols-outlined text-3xl text-slate-500 mb-2">
                account_balance
              </span>
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
                  <span className="material-symbols-outlined">delete</span>
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