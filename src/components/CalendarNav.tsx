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
  const { currentMonth, goToPrevMonth, goToNextMonth, isCurrentMonth, setSelectedDate } =
    useMonth()
  const { year, monthName } = currentMonth
  const canGoNext = !isCurrentMonth(currentMonth.year, currentMonth.month)

  const goToToday = () => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setSelectedDate(today)
  }

  const isToday = () => {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    return currentMonth.selectedDate === todayStr
  }

  return (
    <GlassCard
      className={'flex items-center justify-between gap-5 py-2' + className}
    >
      <IconButton
        onClick={goToPrevMonth}
        disabled={locked}
        icon="chevron_left"
        className="w-10 h-10 cursor-pointer"
      />
      <div
        className="text-center cursor-pointer"
        onClick={goToToday}
      >
        <h2 className="text-xl font-bold text-on-surface tracking-tight">
          {monthName} {year}
        </h2>
        <p className="text-[8px] text-outline tracking-widest mt-0.5">
          {isToday() ? 'Today' : 'Go to Today'}
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
