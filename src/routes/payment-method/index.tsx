import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { TopAppBar, BottomNavBar, GlassCard, ActionListItem } from '../../components/ui'

export const Route = createFileRoute('/payment-method/')({
  component: PaymentMethodPage,
})

const mockPaymentMethods = [
  { id: '1', name: 'Visa ending 4242', icon: 'credit_card', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  { id: '2', name: 'Mastercard', icon: 'credit_card', iconBg: 'bg-secondary/10', iconColor: 'text-secondary' },
  { id: '3', name: 'Cash', icon: 'payments', iconBg: 'bg-tertiary/10', iconColor: 'text-tertiary' },
]

const navItems = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'account_circle', label: 'Profile', to: '/profile' },
  { icon: 'settings', label: 'Settings', to: '/settings', active: true },
]

function PaymentMethodPage() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopAppBar showProfile />
      
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/settings" className="text-secondary material-symbols-outlined hover:text-cyan-400 transition-colors">
              arrow_back
            </Link>
            <span className="text-secondary text-sm uppercase tracking-widest">Settings</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Payment Methods</h1>
          <p className="text-slate-400 mt-2">
            Manage your payment methods for tracking expenses.
          </p>
        </header>

        {/* Add Button */}
        <div className="mb-6">
          <Link to="/payment-method/add" className="bg-primary-container text-on-primary-container py-3 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto">
            <span className="material-symbols-outlined">add_circle</span>
            Add New Payment Method
          </Link>
        </div>

        {/* Payment Methods List */}
        <section className="flex flex-col gap-3">
          {mockPaymentMethods.map((method) => (
            <div key={method.id} className="glass-card flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${method.iconBg} ${method.iconColor}`}>
                  <span className="material-symbols-outlined">{method.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">{method.name}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-slate-500 hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button className="p-2 text-slate-500 hover:text-error transition-colors">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>

      <BottomNavBar items={navItems} />
    </div>
  )
}