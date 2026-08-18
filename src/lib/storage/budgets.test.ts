import { beforeEach, describe, expect, it } from 'vitest'
import { clearAllData, getMonthBudget, setMonthBudget } from '#/lib/storage'

const budget = {
  monthId: '2024-5',
  year: 2024,
  number: 5,
  totalBudget: 1000,
  categoryBudgets: { 'cat-1': 300 },
}

describe('month budgets', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('returns undefined when no budget exists for a month', async () => {
    await expect(getMonthBudget(2024, 5)).resolves.toBeUndefined()
  })

  it('creates a budget keyed by month', async () => {
    const created = await setMonthBudget(budget)
    expect(created.monthId).toBe('2024-5')
    expect(created.totalBudget).toBe(1000)

    const fetched = await getMonthBudget(2024, 5)
    expect(fetched?.totalBudget).toBe(1000)
  })

  it('upserts the same budget instead of duplicating', async () => {
    const first = await setMonthBudget(budget)
    const second = await setMonthBudget({
      ...budget,
      totalBudget: 2000,
    })

    expect(second.id).toBe(first.id)
    const fetched = await getMonthBudget(2024, 5)
    expect(fetched?.totalBudget).toBe(2000)
  })

  it('keeps separate budgets for different months', async () => {
    await setMonthBudget(budget)
    await setMonthBudget({ ...budget, year: 2024, number: 6 })

    expect((await getMonthBudget(2024, 5))?.totalBudget).toBe(1000)
    expect((await getMonthBudget(2024, 6))?.totalBudget).toBe(1000)
  })
})