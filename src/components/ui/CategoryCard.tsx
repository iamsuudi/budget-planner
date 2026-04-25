import { ProgressBar } from './ProgressBar'

interface CategoryBudget {
  id: string
  name: string
  description: string
  icon: string
  used: number
  total: number
  percentage: number
  color: 'violet' | 'cyan' | 'emerald' | 'slate'
}

interface CategoryCardProps {
  category: CategoryBudget
}

export function CategoryCard({ category }: CategoryCardProps) {
  const remaining = category.total - category.used
  const remainingColor = remaining < 50 ? 'text-error' : 'text-tertiary'

  const colorConfig = {
    violet: {
      bg: 'bg-primary-container/20',
      text: 'text-primary-container',
      border: 'border-primary-container/30',
      bar: 'violet' as const,
    },
    cyan: {
      bg: 'bg-secondary-container/20',
      text: 'text-secondary-container',
      border: 'border-secondary-container/30',
      bar: 'cyan' as const,
    },
    emerald: {
      bg: 'bg-tertiary-container/20',
      text: 'text-tertiary-container',
      border: 'border-tertiary-container/30',
      bar: 'emerald' as const,
    },
    slate: {
      bg: 'bg-outline-variant/20',
      text: 'text-on-surface-variant',
      border: 'border-outline-variant/30',
      bar: 'slate' as const,
    },
  }

  const config = colorConfig[category.color]

  return (
    <div className="glass-card rounded-xl p-6 rim-light flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center ${config.text} border ${config.border}`}>
            <span className="material-symbols-outlined">{category.icon}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">{category.name}</h3>
            <p className="text-xs text-outline">{category.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold ${config.text}`}>{category.percentage}%</span>
          <p className="text-xs text-outline-variant">used</p>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <div className="flex justify-between text-xs">
          <span className="text-on-surface-variant">
            ${category.used.toLocaleString()} <span className="text-outline">/ ${category.total.toLocaleString()}</span>
          </span>
          <span className={`font-bold ${remainingColor}`}>${remaining > 0 ? '$' + remaining.toLocaleString() : '$0.00'} left</span>
        </div>
        <ProgressBar percentage={category.percentage} color={config.bar} showGlow />
      </div>
    </div>
  )
}