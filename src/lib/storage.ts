import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { ExpenseCategory } from '#/types/expense'
import type { PaymentMethod } from '#/types/payment-method'
import type { Invoice } from '#/types/invoice'
import type { MonthBudget } from '#/types/month'
import type { User } from '#/types/user'
import type { Wallet } from '#/types/wallet'

interface BudgetManagerDB extends DBSchema {
  user: {
    key: string
    value: User
  }
  wallets: {
    key: string
    value: Wallet
    indexes: { 'by-deleted': number }
  }
  expenseCategories: {
    key: string
    value: ExpenseCategory
    indexes: { 'by-deleted': number }
  }
  paymentMethods: {
    key: string
    value: PaymentMethod
    indexes: { 'by-deleted': number }
  }
  invoices: {
    key: string
    value: Invoice
    indexes: { 'by-date': string }
  }
  monthBudgets: {
    key: string
    value: MonthBudget
    indexes: { 'by-month': string }
  }
}

let dbPromise: Promise<IDBPDatabase<BudgetManagerDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<BudgetManagerDB>('budget-manager', 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          const categoryStore = db.createObjectStore('expenseCategories', {
            keyPath: 'id',
          })
          categoryStore.createIndex('by-deleted', 'deletedAt')

          const paymentStore = db.createObjectStore('paymentMethods', {
            keyPath: 'id',
          })
          paymentStore.createIndex('by-deleted', 'deletedAt')

          const invoiceStore = db.createObjectStore('invoices', {
            keyPath: 'id',
          })
          invoiceStore.createIndex('by-date', 'date')

          const monthStore = db.createObjectStore('monthBudgets', {
            keyPath: 'id',
          })
          monthStore.createIndex('by-month', 'monthId')
        }
        if (oldVersion < 2) {
          db.createObjectStore('user', { keyPath: 'id' })

          const walletStore = db.createObjectStore('wallets', { keyPath: 'id' })
          walletStore.createIndex('by-deleted', 'deletedAt')
        }
      },
    })
  }
  return dbPromise
}

export async function generateId(): Promise<string> {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

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

export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  const db = await getDB()
  const all = await db.getAll('paymentMethods')
  return all
    .filter((pm) => !pm.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function getPaymentMethodById(
  id: string,
): Promise<PaymentMethod | undefined> {
  const db = await getDB()
  return db.get('paymentMethods', id)
}

export async function addPaymentMethod(
  paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>,
): Promise<PaymentMethod> {
  const db = await getDB()
  const newPaymentMethod: PaymentMethod = {
    ...paymentMethod,
    id: await generateId(),
    createdAt: Date.now(),
  }
  await db.put('paymentMethods', newPaymentMethod)
  return newPaymentMethod
}

export async function updatePaymentMethod(
  id: string,
  updates: Partial<Omit<PaymentMethod, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('paymentMethods', id)
  if (existing) {
    await db.put('paymentMethods', { ...existing, ...updates })
  }
}

export async function deletePaymentMethod(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('paymentMethods', id)
  if (existing) {
    await db.put('paymentMethods', { ...existing, deletedAt: Date.now() })
  }
}

export async function getInvoicesByMonth(
  year: number,
  month: number,
): Promise<Invoice[]> {
  const db = await getDB()
  const all = await db.getAll('invoices')
  return all
    .filter((inv) => {
      const date = new Date(inv.date)
      return date.getFullYear() === year && date.getMonth() + 1 === month
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  const db = await getDB()
  return db.get('invoices', id)
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

export async function getUser(): Promise<User | undefined> {
  const db = await getDB()
  const all = await db.getAll('user')
  return all[0]
}

export async function saveUser(
  user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<User> {
  const db = await getDB()
  const existing = await getUser()
  const now = Date.now()
  const newUser: User = {
    ...user,
    id: existing?.id || 'default-user',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
  await db.put('user', newUser)
  return newUser
}

export async function getAllWallets(): Promise<Wallet[]> {
  const db = await getDB()
  const all = await db.getAll('wallets')
  return all
    .filter((w) => !w.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function getWalletById(id: string): Promise<Wallet | undefined> {
  const db = await getDB()
  return db.get('wallets', id)
}

export async function addWallet(
  wallet: Omit<Wallet, 'id' | 'createdAt'>,
): Promise<Wallet> {
  const db = await getDB()
  const newWallet: Wallet = {
    ...wallet,
    id: await generateId(),
    createdAt: Date.now(),
  }
  await db.put('wallets', newWallet)
  return newWallet
}

export async function updateWallet(
  id: string,
  updates: Partial<Omit<Wallet, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = await getDB()
  const existing = await db.get('wallets', id)
  if (existing) {
    await db.put('wallets', { ...existing, ...updates })
  }
}

export async function deleteWallet(id: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get('wallets', id)
  if (existing) {
    await db.put('wallets', { ...existing, deletedAt: Date.now() })
  }
}

export async function getCurrency(): Promise<string> {
  const user = await getUser()
  return user?.currency || 'USD'
}

export async function setCurrency(currency: string): Promise<void> {
  const db = await getDB()
  const existing = await getUser()
  const now = Date.now()
  const user: User = {
    id: existing?.id || 'default-user',
    name: existing?.name || '',
    email: existing?.email || '',
    profilePicture: existing?.profilePicture,
    currency,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
  await db.put('user', user)
}

export { getDB }

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('user')
  await db.clear('wallets')
  await db.clear('expenseCategories')
  await db.clear('paymentMethods')
  await db.clear('invoices')
  await db.clear('monthBudgets')
}
