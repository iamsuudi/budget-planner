import { beforeEach, describe, expect, it } from 'vitest'
import {
  addSalaryCategory,
  clearAllData,
  deleteSalaryCategory,
  getAllSalaryCategories,
  getSalaryCategoryById,
  updateSalaryCategory,
} from '#/lib/storage'

const category = {
  name: 'Salary',
  icon: 'payments',
  walletId: 'wallet-1',
}

describe('salary categories', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('adds and lists salary categories', async () => {
    await addSalaryCategory(category)
    const all = await getAllSalaryCategories()
    expect(all).toHaveLength(1)
    expect(all[0].name).toBe('Salary')
  })

  it('updates a salary category', async () => {
    const created = await addSalaryCategory(category)
    await updateSalaryCategory(created.id, { name: 'Freelance' })
    expect((await getSalaryCategoryById(created.id))?.name).toBe('Freelance')
  })

  it('soft-deletes a salary category', async () => {
    const created = await addSalaryCategory(category)
    await deleteSalaryCategory(created.id)
    expect(await getAllSalaryCategories()).toHaveLength(0)
    expect((await getSalaryCategoryById(created.id))?.deletedAt).toBeGreaterThan(
      0,
    )
  })
})