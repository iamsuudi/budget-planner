import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface MonthState {
  year: number
  month: number
  monthName: string
}

interface MonthContextType {
  currentMonth: MonthState
  setCurrentMonth: (year: number, month: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  isCurrentMonth: (year: number, month: number) => boolean
}

const MonthContext = createContext<MonthContextType | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const [currentMonth, setCurrentMonthState] = useState<MonthState>(() => {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      monthName: MONTHS[now.getMonth()]
    }
  })

  const setCurrentMonth = (year: number, month: number) => {
    setCurrentMonthState({
      year,
      month,
      monthName: MONTHS[month - 1]
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

  return (
    <MonthContext.Provider value={{ currentMonth, setCurrentMonth, goToPrevMonth, goToNextMonth, isCurrentMonth }}>
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