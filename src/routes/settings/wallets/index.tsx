import { createFileRoute, Link } from '@tanstack/react-router'
import { Building2, PlusCircle, Trash2 } from 'lucide-react'
import { useGetWallets, useDeleteWallet } from '#/hooks/query'
import { ActionListItem } from '#/components/ActionListItem'
import { GlassCard } from '#/components/GlassCard'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/settings/wallets/')({
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
    <div className="">
      <TopAppBar showBack backTo={'/settings'} />

      <Page>
        <section className="flex flex-col gap-3">
          <section className="flex justify-between items-center mb-6 gap-3">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Wallets</h2>
              <p className="text-slate-400 text-sm">
                You have ({wallets.length}) wallets
              </p>
            </div>
            {wallets.length > 0 && (
              <Link
                to="/settings/wallets/add"
                className="bg-primary-container text-on-primary-container py-2 px-4 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Add
              </Link>
            )}
          </section>

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : wallets.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center gap-2 p-6">
              <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h2 className="">No wallets yet</h2>
              <p className="text-slate-400 text-sm text-center max-w-80">
                You haven't created any wallets yet. Get started by creating
                your first wallet.
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
            wallets.map((wallet) => (
              <div key={wallet.id} className="relative group">
                <Link
                  to={`/settings/wallets/edit/$id`}
                  params={{ id: wallet.id.toString() }}
                  className="block"
                >
                  <ActionListItem
                    icon="account_balance"
                    iconBg="bg-violet-500/20"
                    iconColor="text-violet-400"
                    title={wallet.name}
                    description={wallet.accountNumber}
                    showChevron={false}
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
    </div>
  )
}
