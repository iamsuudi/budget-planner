import { getDB, generateId } from './db'
import type { SalaryCategory } from '#/types/salary-category'

export async function getAllSalaryCategories(): Promise<SalaryCategory[]> {
  const db = await getDB()
  const all = await db.getAll('salaryCategories')
  return all
    .filter((c) => !c.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function getSalaryCategoryById(
  id: string,
): Promise<SalaryCategory | undefined> {
  const db = await getDB()
  return db.get('salaryCategories', id)
}

export async function addSalaryCategory(
  category: Omit<SalaryCategory, 'id' | 'createdAt'>,
): Promise<SalaryCategory> {
  const db = await getDB()
  const newCategory: SalaryCategory = {
    ...category,
    id: await generateId(),
    createdAt: Date.now(),
  }
  await db.put('salaryCategories', newCategory)
  return newCategory
}

export async function updateSalaryCategory(
  id: string,
  updates: Partial<Omit<SalaryCategory, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('salaryCategories', id)
  if (existing) {
    await db.put('salaryCategories', { ...existing, ...updates })
  }
}

export async function deleteSalaryCategory(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('salaryCategories', id)
  if (existing) {
    await db.put('salaryCategories', { ...existing, deletedAt: Date.now() })
  }
}
