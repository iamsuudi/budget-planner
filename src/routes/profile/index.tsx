import { createFileRoute } from '@tanstack/react-router'
import { TopAppBar, BottomNavBar, GlassCard, ActionListItem } from '../../components/ui'

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
})

const navItems = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'account_circle', label: 'Profile', to: '/profile', active: true },
  { icon: 'settings', label: 'Settings', to: '/settings' },
]

function ProfilePage() {
  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar showProfile={true} />
      
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
        {/* Profile Header Section */}
        <section className="flex flex-col items-center text-center mb-10">
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-violet-500 to-secondary glow-violet">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface">
                <img
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdsET_wxFgrh83We0QxYwiNHiU9byPuaFpmOOBPy8yNw72W7nFFCa-vi4FMp39Oo1hGuXk5OdHQ8snnrE2Ag_bw12x5YlmUXPim4H_KqlNG7Xp0rlyAGcH9v0stLCRuZNQNBBaUXs4irNhcvOyVEtD-DLsWrH5Mj9mvijrwQStd8yzzTgl1JWm8rMiUnMGPAhMEkYkvsZtjrNoJZFTYhPjVOVohC4tJIOgfAFX8lpWppsXglQ7WQ5QQ6klzQWZele_K-w_L8L__-uE"
                />
              </div>
            </div>
            <button className="absolute bottom-4 right-0 bg-primary-container text-on-primary-container p-2 rounded-full shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold text-on-background">
            Marcus Sterling
          </h1>
          <p className="text-slate-400">m.sterling@vividledger.io</p>
        </section>

        {/* Bento Stats Grid */}
        <section className="grid grid-cols-2 gap-5 mb-10">
          <div className="glass-card rounded-xl p-6 flex flex-col gap-2 border-l-4 border-tertiary glow-cyan">
            <span className="text-xs text-tertiary uppercase tracking-widest">
              Total Saved
            </span>
            <span className="text-2xl font-bold text-on-background">$42,850.00</span>
            <div className="flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span className="text-xs">+12% this year</span>
            </div>
          </div>
          <div className="glass-card rounded-xl p-6 flex flex-col gap-2 border-l-4 border-violet-500 glow-violet">
            <span className="text-xs text-violet-400 uppercase tracking-widest">
              Spent Monthly
            </span>
            <span className="text-2xl font-bold text-on-background">$3,120.45</span>
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
              <span className="text-xs">82% of budget</span>
            </div>
          </div>
        </section>

        {/* Account Actions List */}
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1 px-2">
            Account Settings
          </h2>
          <ActionListItem
            icon="person"
            iconBg="bg-surface-container"
            title="Personal Info"
            description="Address, Phone, SSN"
          />
          <ActionListItem
            icon="account_balance"
            iconBg="bg-surface-container"
            title="My Wallets"
            description="3 Active connections"
          />
          <ActionListItem
            icon="credit_card"
            iconBg="bg-surface-container"
            title="Payment Methods"
            description="Default: Visa ending 4242"
          />
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
      </main>

      <BottomNavBar items={navItems} />
    </div>
  )
}