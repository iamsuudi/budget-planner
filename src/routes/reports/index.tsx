import { createFileRoute } from '@tanstack/react-router'
import { useCurrency } from '#/lib/currency-context'
import { BottomNavBar } from '#/components/BottomNavBar'
import { CategoryCard } from '#/components/CategoryCard'
import { GlassCard } from '#/components/GlassCard'
import { IconButton } from '#/components/IconButton'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

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

function ReportsPage() {
  const { formatAmount } = useCurrency()

  return (
    <div className="">
      <TopAppBar showProfile={false} />

      <Page>
        <section className="mb-6">
          <GlassCard className="flex items-center justify-between">
            <IconButton icon="chevron_left" className="w-10 h-10" />
            <div className="text-center">
              <h2 className="text-lg font-bold text-on-surface tracking-tight">
                October 2023
              </h2>
              <p className="text-[10px] text-outline uppercase tracking-widest mt-0.5">
                Monthly Analytics
              </p>
            </div>
            <IconButton icon="chevron_right" className="w-10 h-10" />
          </GlassCard>
        </section>

        <section className="mb-6">
          <div className="relative h-36 rounded-xl overflow-hidden glass-card p-4 flex items-end">
            <img
              alt="Financial Analytics"
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBg1IK-7sJ5JjoVX1QXTnWxvTvOQ3QIUvJ0Gu3j0h2vL0bDKuZvRNMxe34xK2WFvsHWRhnZY0Cm3ODOBTyX4SABTmjaGqBrH1yPrv1HoSp1f9isyCZ4XOyVMr2Hk2g82yDpbaZFmQYHU4qIU13YqJUsPO4tDXSow-Bxvj6zGMda_7Ca_83585UgfeHlOPJ1DpejdtpGwQOVaZfN8pzwGfxALbuPc5nEDIixjA7YugRoBlzh2jDSU-t8U8obTipHdQpMNvzYLcVHxPN8"
            />
            <div className="relative z-10 w-full flex justify-between items-center">
              <div>
                <p className="text-[10px] text-primary uppercase tracking-widest">
                  Total Performance
                </p>
                <h4 className="text-2xl font-bold text-on-surface">On Track</h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-outline">Balance</p>
                <p className="text-lg font-bold text-tertiary">
                  +{formatAmount(1450)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3">
          {mockCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        <section className="mt-6 bg-surface-container-lowest p-4 rounded-xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px] rounded-full" />
          <div className="relative z-10">
            <h3 className="text-base font-bold text-white mb-2">
              Budget Health Strategy
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Your categorized spending is currently{' '}
              <span className="text-tertiary font-bold">12% lower</span> than
              last month.
            </p>
            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  Budgeted
                </span>
                <span className="text-base font-bold text-white">
                  {formatAmount(2020)}
                </span>
              </div>
              <div className="flex flex-col border-l border-white/10 pl-4">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                  Unallocated
                </span>
                <span className="text-base font-bold text-secondary">
                  {formatAmount(480)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </Page>
    </div>
  )
}