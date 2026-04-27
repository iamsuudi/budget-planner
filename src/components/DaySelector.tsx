import { useMonth } from '#/lib/month-context'

export function DaySelector() {
  const { currentMonth, setSelectedDate, getDaysInMonth } = useMonth()
  const days = getDaysInMonth()
  const { selectedDate } = currentMonth

  return (
    <div className="overflow-x-auto pb-2 no-scrollbar">
      <div className="flex gap-2 min-w-max px-1">
        {days.map(({ day, date, dayName, isToday }) => {
          const isSelected = date === selectedDate
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center w-12 h-16 rounded-xl transition-all cursor-pointer
                ${
                  isSelected
                    ? 'bg-primary-container text-on-primary-container scale-105'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }
                ${isToday && !isSelected ? 'ring-2 ring-primary' : ''}
              `}
            >
              <span className="text-[10px] font-medium">{dayName}</span>
              <span className="text-lg font-bold">{day}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
