import { getDB, generateId } from './db'
import type { Invoice } from '#/types/invoice'

export async function getInvoicesByMonth(
  year: number,
  month: number,
  type?: Invoice['type'],
): Promise<Invoice[]> {
  const db = await getDB()
  const all = await db.getAll('invoices')
  return all
    .filter((inv) => {
      const date = new Date(inv.date)
      const matchesDate =
        date.getFullYear() === year && date.getMonth() + 1 === month
      const invoiceType = inv.type || 'expense'
      const matchesType = type ? invoiceType === type : true
      return matchesDate && matchesType
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const db = await getDB()
  return db.get('invoices', id)
}

export async function getInvoicesByType(
  type: Invoice['type'],
  year?: number,
  month?: number,
): Promise<Invoice[]> {
  const db = await getDB()
  let all = await db.getAll('invoices')
  all = all.filter((inv) => {
    const invoiceType = inv.type || 'expense'
    return invoiceType === type
  })
  if (year && month) {
    all = all.filter((inv) => {
      const date = new Date(inv.date)
      return date.getFullYear() === year && date.getMonth() + 1 === month
    })
  }
  return all.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

export async function addInvoice(
  invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Invoice> {
  const db = await getDB()
  const newInvoice: Invoice = {
    ...invoice,
    id: await generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await db.put('invoices', newInvoice)
  return newInvoice
}

export async function updateInvoice(
  id: string,
  updates: Partial<Omit<Invoice, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('invoices', id)
  if (existing) {
    await db.put('invoices', { ...existing, ...updates, updatedAt: Date.now() })
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('invoices', id)
}
