import { beforeEach, describe, expect, it } from 'vitest'
import {
  addCategory,
  clearAllData,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from '#/lib/storage'

const category = {
  name: 'Food',
  icon: 'restaurant',
  walletId: 'wallet-1',
}

describe('expense categories', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('adds and lists categories in creation order', async () => {
    await addCategory(category)
    await addCategory({ ...category, name: 'Travel', icon: 'flight' })

    const all = await getAllCategories()
    expect(all.map((c) => c.name)).toEqual(['Food', 'Travel'])
  })

  it('updates a category', async () => {
    const created = await addCategory(category)
    await updateCategory(created.id, { name: 'Groceries' })
    const updated = await getCategoryById(created.id)
    expect(updated?.name).toBe('Groceries')
  })

  it('soft-deletes a category', async () => {
    const created = await addCategory(category)
    await deleteCategory(created.id)

    expect(await getAllCategories()).toHaveLength(0)
    const stored = await getCategoryById(created.id)
    expect(stored?.deletedAt).toBeGreaterThan(0)
  })
})