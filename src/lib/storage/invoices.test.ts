import { beforeEach, describe, expect, it } from 'vitest'
import {
  addInvoice,
  clearAllData,
  deleteInvoice,
  getInvoiceById,
  getInvoicesByMonth,
  getInvoicesByType,
  updateInvoice,
} from '#/lib/storage'

const base = {
  amount: 250,
  date: '2024-05-15',
  categoryId: 'cat-1',
  categoryName: 'Food',
  type: 'expense' as const,
}

describe('invoices', () => {
  beforeEach(async () => {
    await clearAllData()
  })

  it('adds an invoice with id and timestamps', async () => {
    const invoice = await addInvoice(base)
    expect(invoice.id).toBeTruthy()
    expect(invoice.createdAt).toBeGreaterThan(0)
    expect(invoice.updatedAt).toBeGreaterThan(0)
    expect(invoice.amount).toBe(250)
  })

  it('returns invoices filtered and sorted by month', async () => {
    await addInvoice({ ...base, date: '2024-05-10', amount: 100 })
    await addInvoice({ ...base, date: '2024-05-20', amount: 200 })
    await addInvoice({ ...base, date: '2024-04-20', amount: 999 })

    const may = await getInvoicesByMonth(2024, 5)
    expect(may).toHaveLength(2)
    expect(may[0].amount).toBe(200)
    expect(may[1].amount).toBe(100)

    const april = await getInvoicesByMonth(2024, 4)
    expect(april).toHaveLength(1)
    expect(april[0].amount).toBe(999)
  })

  it('filters by invoice type', async () => {
    await addInvoice(base)
    await addInvoice({ ...base, type: 'salary', amount: 5000 })

    const expenses = await getInvoicesByType('expense')
    const salaries = await getInvoicesByType('salary')

    expect(expenses).toHaveLength(1)
    expect(salaries).toHaveLength(1)
    expect(salaries[0].amount).toBe(5000)
  })

  it('updates an existing invoice', async () => {
    const invoice = await addInvoice(base)
    await updateInvoice(invoice.id, { amount: 999 })
    const updated = await getInvoiceById(invoice.id)
    expect(updated?.amount).toBe(999)
  })

  it('deletes an invoice', async () => {
    const invoice = await addInvoice(base)
    await deleteInvoice(invoice.id)
    await expect(getInvoiceById(invoice.id)).resolves.toBeUndefined()
  })
})