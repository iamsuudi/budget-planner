import { useMonth } from '#/lib/month-context'
import { IconButton } from './IconButton'
import { GlassCard } from './GlassCard'

interface CalendarNavProps {
  className?: string
  locked?: boolean
}

export function CalendarNav({
  className = '',
  locked = false,
}: CalendarNavProps) {
  const { currentMonth, goToPrevMonth, goToNextMonth, isCurrentMonth } =
    useMonth()
  const { year, monthName } = currentMonth
  const canGoNext = !isCurrentMonth(currentMonth.year, currentMonth.month)

  return (
    <GlassCard
      className={'flex items-center justify-between gap-5' + className}
    >
      <IconButton
        onClick={goToPrevMonth}
        disabled={locked}
        icon="chevron_left"
        className="w-10 h-10 cursor-pointer"
      />
      <div className="text-center">
        <h2 className="text-xl font-bold text-on-surface tracking-tight">
          {monthName} {year}
        </h2>
        <p className="text-[8px] text-outline tracking-widest mt-0.5">
          Monthly Analytics
        </p>
      </div>
      <IconButton
        onClick={goToNextMonth}
        disabled={!canGoNext || locked}
        icon="chevron_right"
        className="w-10 h-10 cursor-pointer"
      />
    </GlassCard>
  )
}
