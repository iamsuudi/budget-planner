interface ProgressBarProps {
  percentage: number
  color?: 'gradient' | 'violet' | 'cyan' | 'emerald' | 'slate'
  showGlow?: boolean
}

export function ProgressBar({ percentage, color = 'gradient', showGlow = false }: ProgressBarProps) {
  const colorClasses = {
    gradient: 'from-secondary to-tertiary',
    violet: 'bg-primary-container',
    cyan: 'bg-secondary-container',
    emerald: 'bg-tertiary-container',
    slate: 'bg-outline',
  }

  const glowClass = showGlow ? 'shadow-[0_0_12px_rgba(76,215,246,0.5)]' : ''

  return (
    <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
      <div
        className={`h-full ${colorClasses[color]} rounded-full ${glowClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}