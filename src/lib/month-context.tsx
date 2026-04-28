import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface MonthState {
  year: number
  month: number
  monthName: string
  selectedDate: string
  selectedDay: number
}

interface MonthContextType {
  currentMonth: MonthState
  setCurrentMonth: (year: number, month: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  isCurrentMonth: (year: number, month: number) => boolean
  setSelectedDate: (date: string) => void
  getDaysInMonth: () => { day: number; date: string; dayName: string; isToday: boolean }[]
}

const MonthContext = createContext<MonthContextType | null>(null)

function getTodayString() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function MonthProvider({ children }: { children: ReactNode }) {
  const [currentMonth, setCurrentMonthState] = useState<MonthState>(() => {
    const now = new Date()
    const today = getTodayString()
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      monthName: MONTHS[now.getMonth()],
      selectedDate: today,
      selectedDay: now.getDate(),
    }
  })

  const setCurrentMonth = (year: number, month: number) => {
    const date = new Date(year, month - 1, 1)
    const selectedDate = `${year}-${String(month).padStart(2, '0')}-01`
    setCurrentMonthState({
      year,
      month,
      monthName: MONTHS[month - 1],
      selectedDate,
      selectedDay: 1,
    })
  }

  const goToPrevMonth = () => {
    const { year, month } = currentMonth
    if (month === 1) {
      setCurrentMonth(year - 1, 12)
    } else {
      setCurrentMonth(year, month - 1)
    }
  }

  const goToNextMonth = () => {
    const now = new Date()
    const { year, month } = currentMonth
    if (year === now.getFullYear() && month === now.getMonth() + 1) return
    if (month === 12) {
      setCurrentMonth(year + 1, 1)
    } else {
      setCurrentMonth(year, month + 1)
    }
  }

  const isCurrentMonth = (year: number, month: number) => {
    const now = new Date()
    return year === now.getFullYear() && month === now.getMonth() + 1
  }

  const setSelectedDate = (date: string) => {
    const d = new Date(date + 'T00:00:00')
    const newYear = d.getFullYear()
    const newMonth = d.getMonth() + 1
    setCurrentMonthState((prev) => {
      const next = {
        ...prev,
        selectedDate: date,
        selectedDay: d.getDate(),
      }
      if (prev.year !== newYear || prev.month !== newMonth) {
        next.year = newYear
        next.month = newMonth
        next.monthName = MONTHS[newMonth - 1]
      }
      return next
    })
  }

  const getDaysInMonth = () => {
    const { year, month } = currentMonth
    const daysInMonth = new Date(year, month, 0).getDate()
    const todayStr = getTodayString()
    const days = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const d = new Date(date + 'T00:00:00')
      days.push({
        day,
        date,
        dayName: DAYS_SHORT[d.getDay()],
        isToday: date === todayStr,
      })
    }
    return days
  }

  return (
    <MonthContext.Provider
      value={{
        currentMonth,
        setCurrentMonth,
        goToPrevMonth,
        goToNextMonth,
        isCurrentMonth,
        setSelectedDate,
        getDaysInMonth,
      }}
    >
      {children}
    </MonthContext.Provider>
  )
}

export function useMonth() {
  const context = useContext(MonthContext)
  if (!context) {
    throw new Error('useMonth must be used within MonthProvider')
  }
  return context
}
