interface ProgressBarProps {
  percentage: number
  color?: 'gradient' | 'violet' | 'cyan' | 'emerald' | 'slate' | 'red'
  showGlow?: boolean
}

export function ProgressBar({ percentage, color, showGlow = false }: ProgressBarProps) {
  const colorClasses = {
    gradient: 'from-secondary to-tertiary',
    violet: 'bg-primary-container',
    cyan: 'bg-secondary-container',
    emerald: 'bg-tertiary-container',
    slate: 'bg-outline',
    red: 'bg-error',
  }

  const glowClass = showGlow ? 'shadow-[0_0_12px_rgba(239,68,68,0.5)]' : ''

  const fillColor = color || (percentage >= 100 ? 'red' : percentage >= 80 ? 'emerald' : 'gradient')

  return (
    <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClasses[fillColor]} rounded-full ${glowClass} ${
          fillColor === 'gradient'
            ? 'bg-gradient-to-r'
            : ''
        }`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}