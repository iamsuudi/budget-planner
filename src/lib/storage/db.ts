import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { ExpenseCategory } from '#/types/expense'
import type { Invoice } from '#/types/invoice'
import type { MonthBudget } from '#/types/month'
import type { SalaryCategory } from '#/types/salary-category'
import type { User } from '#/types/user'
import type { Wallet } from '#/types/wallet'
import type { TodoCategory, TodoTask } from '#/types/todo'
import type { Note } from '#/types/note'

export interface BudgetManagerDB extends DBSchema {
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
  salaryCategories: {
    key: string
    value: SalaryCategory
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
  todoCategories: {
    key: string
    value: TodoCategory
    indexes: { 'by-deleted': number }
  }
  todoTasks: {
    key: string
    value: TodoTask
    indexes: { 'by-category': string; 'by-date': string }
  }
  notes: {
    key: string
    value: Note
    indexes: { 'by-deleted': number }
  }
}

let dbPromise: Promise<IDBPDatabase<BudgetManagerDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<BudgetManagerDB>('budget-manager', 7, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const categoryStore = db.createObjectStore('expenseCategories', {
            keyPath: 'id',
          })
          categoryStore.createIndex('by-deleted', 'deletedAt')

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
        if (oldVersion < 3) {
          try {
            const storeNames = db.objectStoreNames as unknown as string[]
            if (storeNames.includes('paymentMethods')) {
              db.deleteObjectStore('paymentMethods' as never)
            }
          } catch {}
        }
        if (oldVersion < 5) {
          if (!db.objectStoreNames.contains('salaryCategories')) {
            db.createObjectStore('salaryCategories', {
              keyPath: 'id',
            }).createIndex('by-deleted', 'deletedAt')
          }
        }
        if (oldVersion < 6) {
          if (!db.objectStoreNames.contains('todoCategories')) {
            db.createObjectStore('todoCategories', {
              keyPath: 'id',
            }).createIndex('by-deleted', 'deletedAt')
          }
          if (!db.objectStoreNames.contains('todoTasks')) {
            const taskStore = db.createObjectStore('todoTasks', {
              keyPath: 'id',
            })
            taskStore.createIndex('by-category', 'categoryId')
            taskStore.createIndex('by-date', 'date')
          }
        }
        if (oldVersion < 7) {
          if (!db.objectStoreNames.contains('notes')) {
            db.createObjectStore('notes', {
              keyPath: 'id',
            }).createIndex('by-deleted', 'deletedAt')
          }
        }
      },
    })
  }
  return dbPromise
}

export async function generateId(): Promise<string> {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('user')
  await db.clear('wallets')
  await db.clear('expenseCategories')
  await db.clear('salaryCategories')
  await db.clear('invoices')
  await db.clear('monthBudgets')
  await db.clear('todoCategories')
  await db.clear('todoTasks')
  await db.clear('notes')
}
