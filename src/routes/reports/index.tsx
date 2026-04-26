import { createFileRoute } from '@tanstack/react-router'
import { TopAppBar, BottomNavBar, GlassCard, CategoryCard, IconButton } from '../../components/ui'
import { useCurrency } from '../../lib/currency-context'

export const Route = createFileRoute('/reports/')({
  component: ReportsPage,
})

const mockCategories = [
  {
    id: '1',
    name: 'Food',
    description: 'Dining & Groceries',
    icon: 'restaurant',
    used: 450,
    total: 600,
    percentage: 75,
    color: 'violet' as const,
  },
  {
    id: '2',
    name: 'Transport',
    description: 'Fuel & Commute',
    icon: 'directions_car',
    used: 276,
    total: 300,
    percentage: 92,
    color: 'cyan' as const,
  },
  {
    id: '3',
    name: 'Entertainment',
    description: 'Leisure & Hobbies',
    icon: 'movie',
    used: 150,
    total: 500,
    percentage: 30,
    color: 'emerald' as const,
  },
  {
    id: '4',
    name: 'Utilities',
    description: 'Bills & Power',
    icon: 'bolt',
    used: 225,
    total: 450,
    percentage: 50,
    color: 'slate' as const,
  },
]

const navItems = [
  { icon: 'dashboard', label: 'Overview', to: '/' },
  { icon: 'analytics', label: 'Reports', to: '/reports', active: true },
  { icon: 'account_circle', label: 'Profile', to: '/profile' },
  { icon: 'settings', label: 'Settings', to: '/settings' },
]

function ReportsPage() {
  const { formatAmount } = useCurrency()
  
  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopAppBar showProfile={false} />
      
      <main className="pt-24 pb-32 px-6 max-w-5xl mx-auto">
        {/* Month Navigation Card */}
        <section className="mb-10">
          <GlassCard className="flex items-center justify-between shadow-xl">
            <IconButton icon="chevron_left" className="w-12 h-12" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-on-surface tracking-tight">
                October 2023
              </h2>
              <p className="text-xs text-outline uppercase tracking-widest mt-1">
                Monthly Analytics
              </p>
            </div>
            <IconButton icon="chevron_right" className="w-12 h-12" />
          </GlassCard>
        </section>

        {/* Summary Decorative Section */}
        <section className="mb-10">
          <div className="relative w-full h-48 rounded-xl overflow-hidden glass-card rim-light p-6 flex items-end">
            <img
              alt="Financial Analytics"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg1IK-7sJ5JjoVX1QXTnWxvTvOQ3QIUvJ0Gu3j0h2vL0bDKuZvRNMxe34xK2WFvsHWRhnZY0Cm3ODOBTyX4SABTmjaGqBrH1yPrv1HoSp1f9isyCZ4XOyVMr2Hk2g82yDpbaZFmQYHU4qIU13YqJUsPO4tDXSow-Bxvj6zGMda_7Ca_83585UgfeHlOPJ1DpejdtpGwQOVaZfN8pzwGfxALbuPc5nEDIixjA7YugRoBlzh2jDSU-t8U8obTipHdQpMNvzYLcVHxPN8"
            />
            <div className="relative z-10 w-full flex justify-between items-center">
              <div>
                <p className="text-xs text-primary uppercase tracking-widest">
                  Total Performance
                </p>
                <h4 className="text-3xl font-bold text-on-surface">
                  On Track
                </h4>
              </div>
              <div className="text-right">
                <p className="text-xs text-outline">
                  Monthly Balance
                </p>
                <p className="text-2xl font-bold text-tertiary">
                  +{formatAmount(1450)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reports Bento Grid / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Budget Health Strategy Section */}
        <section className="mt-10 bg-surface-container-lowest p-8 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full" />
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-bold text-white mb-2">
                Budget Health Strategy
              </h3>
              <p className="text-slate-400 mb-4">
                Your categorized spending is currently <span className="text-tertiary font-bold">12% lower</span> than last month. We recommend allocating the surplus to your "Education" category to maximize your potential.
              </p>
              <div className="flex gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Total Budgeted</span>
                  <span className="text-xl font-bold text-white">{formatAmount(2020)}</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-8">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Unallocated</span>
                  <span className="text-xl font-bold text-secondary">{formatAmount(480)}</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle className="text-slate-800" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12" />
                  <circle className="text-violet-500" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset="138.23" strokeWidth="12" style={{ filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-white">75</span>
                  <span className="text-[10px] uppercase tracking-widest text-violet-400 font-bold">Score</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNavBar items={navItems} />
    </div>
  )
}