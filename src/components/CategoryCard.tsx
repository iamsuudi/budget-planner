import { formatCurrency } from '#/lib/currency'
import { getIcon } from '#/lib/icons'
import { ProgressBar } from './ProgressBar'

interface CategoryBudget {
  id: string
  name: string
  description?: string
  icon: string
  used: number
  total: number
  percentage: number
  color?: 'violet' | 'cyan' | 'emerald' | 'slate'
}

interface CategoryCardProps {
  category: CategoryBudget
}

export function CategoryCard({ category }: CategoryCardProps) {
  const remaining = category.total - category.used

  const getColorConfig = (percentage: number) => {
    if (percentage >= 100) {
      return {
        bg: 'bg-error/20',
        text: 'text-error',
        border: 'border-error/30',
        bar: 'red' as const,
      }
    }
    if (percentage >= 80) {
      return {
        bg: 'bg-tertiary/20',
        text: 'text-tertiary',
        border: 'border-tertiary/30',
        bar: 'emerald' as const,
      }
    }
    return {
      bg: 'bg-primary-container/20',
      text: 'text-primary-container',
      border: 'border-primary-container/30',
      bar: 'violet' as const,
    }
  }

  const config = category.color
    ? {
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
      }[category.color]
    : getColorConfig(category.percentage)

  const remainingColor = remaining < 0 ? 'text-error' : 'text-tertiary'

  return (
    <div className="glass-card rounded-xl p-6 rim-light flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center ${config.text} border ${config.border}`}
          >
            {(() => {
              const IconComponent = getIcon(category.icon)
              return <IconComponent className="w-6 h-6" />
            })()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">
              {category.name}
            </h3>
            <p className="text-xs text-outline">{category.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold ${config.text}`}>
            {category.percentage.toFixed(0)}%
          </span>
          <p className="text-xs text-outline-variant">used</p>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        <div className="flex justify-between text-xs">
          <span className="text-on-surface-variant">
            {formatCurrency(category.used)}{' '}
            <span className="text-outline">
              / {category.total > 0 ? formatCurrency(category.total) : '$0.00'}
            </span>
          </span>
          <span className={`font-bold ${remainingColor}`}>
            {remaining > 0
              ? `${formatCurrency(remaining)} left`
              : remaining === 0
                ? '$0.00 left'
                : `${formatCurrency(Math.abs(remaining))} over`}
          </span>
        </div>
        <ProgressBar
          percentage={category.percentage}
          color={config.bar}
          showGlow={category.percentage >= 80}
        />
      </div>
    </div>
  )
}
