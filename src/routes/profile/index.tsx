import { createFileRoute, Link } from '@tanstack/react-router'
import { useGetUser, useGetWallets, useGetPaymentMethods } from '#/hooks/query'
import { ActionListItem } from '#/components/ActionListItem'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: user } = useGetUser()
  const { data: wallets = [] } = useGetWallets()
  const { data: paymentMethods = [] } = useGetPaymentMethods()

  const firstPaymentMethod = paymentMethods.at(0)
  const profileImage =
    user?.profilePicture ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23d0bcff' width='100' height='100'/%3E%3Ctext x='50' y='50' dominant-baseline='middle' text-anchor='middle' fill='%230b1326' font-size='40'%3E%3F%3C/text%3E%3C/svg%3E"

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar showProfile={true} />

      <Page className="">
        <section className="flex flex-col items-center text-center mb-6">
          <Link
            to="/profile/edit"
            className="relative group mb-3 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full p-0.5 bg-linear-to-tr from-violet-500 to-secondary glow-violet">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-surface">
                <img
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  src={profileImage}
                />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container p-1.5 rounded-full shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </Link>
          <h1 className="text-xl font-bold text-on-background">
            {user?.name || 'Set your name'}
          </h1>
          <p className="text-slate-400 text-sm">
            {user?.email || 'Add your email'}
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-xl p-4 flex flex-col gap-1 border-l-3 border-tertiary glow-cyan">
            <span className="text-[10px] text-tertiary uppercase tracking-widest">
              My Wallets
            </span>
            <span className="text-xl font-bold text-on-background">
              {wallets.length}
            </span>
            <div className="flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-xs">
                account_balance
              </span>
              <span className="text-[10px]">Bank accounts</span>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 flex flex-col gap-1 border-l-3 border-violet-500 glow-violet">
            <span className="text-[10px] text-violet-400 uppercase tracking-widest">
              Payment Methods
            </span>
            <span className="text-xl font-bold text-on-background">
              {paymentMethods.length}
            </span>
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-xs">
                credit_card
              </span>
              <span className="text-[10px]">Active</span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1 px-1">
            Account Settings
          </h2>
          <Link to="/profile/edit">
            <ActionListItem
              icon="person"
              iconBg="bg-surface-container"
              title="Personal Info"
              description={
                user?.name ? 'Edit your profile' : 'Set up your profile'
              }
            />
          </Link>
          <Link to="/wallets">
            <ActionListItem
              icon="account_balance"
              iconBg="bg-surface-container"
              title="My Wallets"
              description={`${wallets.length} Bank accounts`}
            />
          </Link>
          <Link to="/payment-method">
            <ActionListItem
              icon="credit_card"
              iconBg="bg-surface-container"
              title="Payment Methods"
              description={
                firstPaymentMethod
                  ? `Default: ${firstPaymentMethod.name}`
                  : 'Add payment methods'
              }
            />
          </Link>
          <ActionListItem
            icon="logout"
            iconBg="bg-error-container/20"
            iconColor="text-error"
            title="Logout"
            description="Securely end session"
            showChevron={false}
            danger
          />
        </section>
      </Page>
    </div>
  )
}
