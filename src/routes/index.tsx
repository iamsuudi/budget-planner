import { createFileRoute } from '@tanstack/react-router'
import { TopAppBar, BottomNavBar, GlassCard, ProgressBar, TransactionItem } from '../components/ui'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const mockTransactions = [
  {
    id: '1',
    name: 'Luxury Apparel Store',
    category: 'Shopping',
    date: 'Oct 14, 2023',
    amount: 1240.0,
    paymentMethod: 'Debit Card',
    icon: 'shopping_bag',
    iconColor: 'bg-secondary/10 text-secondary',
  },
  {
    id: '2',
    name: 'Midnight Bistro',
    category: 'Dining',
    date: 'Oct 12, 2023',
    amount: 85.5,
    paymentMethod: 'Mobile Pay',
    icon: 'restaurant',
    iconColor: 'bg-tertiary/10 text-tertiary',
  },
  {
    id: '3',
    name: 'Swift Cab Services',
    category: 'Transport',
    date: 'Oct 10, 2023',
    amount: 42.0,
    paymentMethod: 'Debit Card',
    icon: 'commute',
    iconColor: 'bg-primary/10 text-primary',
  },
  {
    id: '4',
    name: 'CloudStream Premium',
    category: 'Entertainment',
    date: 'Oct 08, 2023',
    amount: 15.99,
    paymentMethod: 'Auto-Pay',
    icon: 'subscriptions',
    iconColor: 'bg-secondary-container/10 text-secondary-container',
  },
]

const navItems = [
  { icon: 'home', label: 'Home', to: '/', active: true },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'account_circle', label: 'Profile', to: '/profile' },
  { icon: 'settings', label: 'Settings', to: '/settings' },
]

function HomePage() {
  return (
    <div className="min-h-screen bg-surface-dim text-on-surface antialiased">
      <TopAppBar />
      
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto space-y-10">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-white/5 text-secondary hover:text-secondary-fixed transition-all">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="text-center min-w-[140px]">
              <h2 className="text-2xl font-bold text-on-surface">
                October 2023
              </h2>
            </div>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container border border-white/5 text-secondary hover:text-secondary-fixed transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className="hidden md:flex gap-2">
            <span className="px-4 py-1 rounded-full bg-tertiary/10 text-tertiary text-sm font-semibold">
              On Track
            </span>
          </div>
        </div>

        {/* Main Hero Card (Bento Grid Style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Net Balance Section */}
          <div className="md:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-xl">
              <div>
                <p className="text-sm font-semibold text-on-surface-variant opacity-70 mb-1">
                  Net Balance
                </p>
                <h1 className="text-5xl font-extrabold text-on-surface tracking-tight">
                  $12,450.00
                </h1>
              </div>
              <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                    Monthly Budget
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-400 text-sm">flag</span>
                    <p className="text-2xl font-bold text-secondary">
                      $8,000.00
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">
                    Total Expenses
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
                    <p className="text-2xl font-bold text-primary-container">
                      $3,550.24
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-6">
            <button className="flex-1 bg-primary-container text-on-primary-fixed-variant rounded-[1.5rem] p-6 flex flex-col items-start justify-between shadow-lg glow-violet hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-4xl">add_circle</span>
              <div className="text-left">
                <p className="text-2xl font-bold leading-tight">
                  Add<br />Expense
                </p>
              </div>
            </button>
            <button className="flex-1 border border-secondary text-secondary rounded-[1.5rem] p-6 flex flex-col items-start justify-between hover:bg-secondary/10 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-4xl">payments</span>
              <div className="text-left">
                <p className="text-2xl font-bold leading-tight text-on-surface">
                  Set<br />Budget
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Budget Progress */}
        <GlassCard>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-on-surface">
              Spending Limit Progress
            </p>
            <p className="text-sm font-semibold text-tertiary">
              44% of $8,000 used
            </p>
          </div>
          <ProgressBar percentage={44} color="gradient" showGlow />
        </GlassCard>

        {/* Transaction List Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-2xl font-bold text-on-surface">
              Recent Transactions
            </h3>
            <button className="text-sm font-semibold text-secondary hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-2">
            {mockTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </section>
      </main>

      <BottomNavBar items={navItems} />
    </div>
  )
}