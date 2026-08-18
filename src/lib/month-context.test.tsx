import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MONTHS, MonthProvider, useMonth } from '#/lib/month-context'

const wrapper = ({ children }: { children: ReactNode }) => (
  <MonthProvider>{children}</MonthProvider>
)

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

describe('MonthProvider', () => {
  it('initializes to the current month', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    expect(result.current.currentMonth.year).toBe(currentYear)
    expect(result.current.currentMonth.month).toBe(currentMonth)
    expect(result.current.currentMonth.monthName).toBe(MONTHS[currentMonth - 1])
  })

  it('sets a specific month', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    act(() => result.current.setCurrentMonth(2024, 1))
    expect(result.current.currentMonth.monthName).toBe('January')
    expect(result.current.currentMonth.year).toBe(2024)
  })

  it('wraps from January to December of the previous year', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    act(() => result.current.setCurrentMonth(2024, 1))
    act(() => result.current.goToPrevMonth())
    expect(result.current.currentMonth).toMatchObject({ year: 2023, month: 12 })
  })

  it('wraps from December to January of the next year', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    act(() => result.current.setCurrentMonth(2023, 12))
    act(() => result.current.goToNextMonth())
    expect(result.current.currentMonth).toMatchObject({ year: 2024, month: 1 })
  })

  it('does not navigate past the current month', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    act(() => result.current.setCurrentMonth(currentYear, currentMonth))
    act(() => result.current.goToNextMonth())
    expect(result.current.currentMonth.month).toBe(currentMonth)
    expect(result.current.currentMonth.year).toBe(currentYear)
  })

  it('reports whether a month is the current one', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    expect(result.current.isCurrentMonth(currentYear, currentMonth)).toBe(true)
    expect(result.current.isCurrentMonth(2020, 1)).toBe(false)
  })

  it('returns the correct number of days per month', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    act(() => result.current.setCurrentMonth(2024, 2))
    expect(result.current.getDaysInMonth()).toHaveLength(29)

    act(() => result.current.setCurrentMonth(2023, 2))
    expect(result.current.getDaysInMonth()).toHaveLength(28)
  })

  it('flags only today within the day list', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    const days = result.current.getDaysInMonth()
    const todays = days.filter((d) => d.isToday)
    expect(todays.length).toBeLessThanOrEqual(1)
  })

  it('updates the selected date across months', () => {
    const { result } = renderHook(() => useMonth(), { wrapper })
    act(() => result.current.setSelectedDate('2024-02-15'))
    expect(result.current.currentMonth.selectedDate).toBe('2024-02-15')
    expect(result.current.currentMonth.selectedDay).toBe(15)
    expect(result.current.currentMonth.month).toBe(2)
  })
})