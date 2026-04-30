import { getDB, generateId } from './db'
import type { MonthBudget } from '#/types/month'

export async function getMonthBudget(
  year: number,
  month: number,
): Promise<MonthBudget | undefined> {
  const db = await getDB()
  const monthId = `${year}-${month}`
  return db.getFromIndex('monthBudgets', 'by-month', monthId)
}

export async function setMonthBudget(
  budget: Omit<MonthBudget, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<MonthBudget> {
  const db = await getDB()
  const monthId = `${budget.year}-${budget.number}`
  const existing = await db.getFromIndex('monthBudgets', 'by-month', monthId)

  const newBudget: MonthBudget = {
    ...budget,
    id: existing?.id || (await generateId()),
    monthId,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  }
  await db.put('monthBudgets', newBudget)
  return newBudget
}
