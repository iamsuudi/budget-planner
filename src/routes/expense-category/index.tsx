import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { TopAppBar, BottomNavBar, GlassCard, ProgressBar } from '../../components/ui'

export const Route = createFileRoute('/expense-category/')({
  component: ExpenseCategoryPage,
})

const mockCategories = [
  {
    id: '1',
    name: 'Food & Dining',
    icon: 'restaurant',
    iconBg: 'bg-violet-500/10',
    iconBorder: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    budget: 850,
    percentage: 75,
  },
  {
    id: '2',
    name: 'Transport',
    icon: 'directions_car',
    iconBg: 'bg-secondary-container/10',
    iconBorder: 'border-secondary-container/20',
    iconColor: 'text-secondary',
    budget: 320,
    percentage: 25,
  },
  {
    id: '3',
    name: 'Entertainment',
    icon: 'theater_comedy',
    iconBg: 'bg-tertiary-container/10',
    iconBorder: 'border-tertiary-container/20',
    iconColor: 'text-tertiary',
    budget: 200,
    percentage: 100,
  },
  {
    id: '4',
    name: 'Health',
    icon: 'health_and_safety',
    iconBg: 'bg-primary/10',
    iconBorder: 'border-primary/20',
    iconColor: 'text-primary',
    budget: 150,
    percentage: 50,
  },
  {
    id: '5',
    name: 'Education',
    icon: 'school',
    iconBg: 'bg-secondary-fixed-dim/10',
    iconBorder: 'border-secondary-fixed-dim/20',
    iconColor: 'text-secondary-fixed-dim',
    budget: 500,
    percentage: 10,
  },
]

const navItems = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'category', label: 'Categories', to: '/expense-category', active: true },
  { icon: 'person', label: 'Profile', to: '/profile' },
]

function ExpenseCategoryPage() {
  const totalBudgeted = mockCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const totalBudget = 2020
  const unallocated = totalBudget - totalBudgeted

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar showProfile />
      
      <main className="pt-24 px-6 max-w-7xl mx-auto pb-32">
        {/* Header & Add Action */}
        <section className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Manage Categories
            </h2>
            <p className="text-slate-400">
              Organize your spending and set limits for high-precision tracking.
            </p>
          </div>
          <Link to="/expense-category/add" className="bg-primary-container text-on-primary-container py-3 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined">add_circle</span>
            Add New Category
          </Link>
        </section>

        {/* Category Grid (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCategories.map((category) => (
            <div key={category.id} className="glass-card p-6 rounded-xl flex flex-col justify-between group hover:border-violet-500/40 transition-all glow-violet">
              <div className="flex items-start justify-between mb-4">
                <div className={`${category.iconBg} p-3 rounded-lg border ${category.iconBorder}`}>
                  <span className={`material-symbols-outlined text-3xl ${category.iconColor}`}>
                    {category.icon}
                  </span>
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
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {category.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">Monthly Budget</span>
                  <span className="text-secondary font-bold">${category.budget.toFixed(2)}</span>
                </div>
                <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r from-secondary to-tertiary ${category.percentage >= 100 ? 'rounded-full' : ''}`} style={{ width: `${category.percentage}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">
                    {category.percentage}% Utilized
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">
                    ${((category.budget * (100 - category.percentage)) / 100).toFixed(2)} Remaining
                  </span>
                </div>
              </div>
            </div>
          ))}
          {/* Empty / Add New Card */}
          <div className="border-2 border-dashed border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center gap-4 group hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-slate-600 group-hover:text-violet-400">add</span>
            </div>
            <div className="text-center">
              <span className="text-sm text-slate-500 block">Create Category</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-600">Assign icon & limit</span>
            </div>
          </div>
        </div>

        {/* Budget Overview Section */}
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
                  <span className="text-xl font-bold text-white">${totalBudgeted.toFixed(2)}</span>
                </div>
                <div className="flex flex-col border-l border-white/10 pl-8">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Unallocated</span>
                  <span className="text-xl font-bold text-secondary">${unallocated.toFixed(2)}</span>
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