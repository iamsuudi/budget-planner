import { getDB, generateId } from './db'
import type { ExpenseCategory } from '#/types/expense'

export async function getAllCategories(): Promise<ExpenseCategory[]> {
  const db = await getDB()
  const all = await db.getAll('expenseCategories')
  return all
    .filter((c) => !c.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function getCategoryById(
  id: string,
): Promise<ExpenseCategory | undefined> {
  const db = await getDB()
  return db.get('expenseCategories', id)
}

export async function addCategory(
  category: Omit<ExpenseCategory, 'id' | 'createdAt'>,
): Promise<ExpenseCategory> {
  const db = await getDB()
  const newCategory: ExpenseCategory = {
    ...category,
    id: await generateId(),
    createdAt: Date.now(),
  }
  await db.put('expenseCategories', newCategory)
  return newCategory
}

export async function updateCategory(
  id: string,
  updates: Partial<Omit<ExpenseCategory, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('expenseCategories', id)
  if (existing) {
    await db.put('expenseCategories', { ...existing, ...updates })
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('expenseCategories', id)
  if (existing) {
    await db.put('expenseCategories', { ...existing, deletedAt: Date.now() })
  }
}
