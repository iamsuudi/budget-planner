import { useState, useEffect, useCallback } from 'react'
import { getDB } from '#/lib/storage/db'

export interface StoreUsage {
  name: string
  size: number
}

interface StorageUsage {
  usage: number
  quota: number
  indexedDBSize: number
  otherSize: number
  storeBreakdown: StoreUsage[]
  loading: boolean
}

const STORE_DISPLAY_NAMES: Record<string, string> = {
  user: 'User Profile',
  wallets: 'Wallets',
  expenseCategories: 'Expense Categories',
  salaryCategories: 'Salary Categories',
  invoices: 'Invoices',
  monthBudgets: 'Monthly Budgets',
  todoCategories: 'Todo Categories',
  todoTasks: 'Todo Tasks',
  notes: 'Notes',
}

function calculateObjectSize(obj: unknown): number {
  try {
    const json = JSON.stringify(obj)
    return new TextEncoder().encode(json).length
  } catch {
    return 0
  }
}

async function calculateIndexedDBSize(): Promise<{
  total: number
  breakdown: StoreUsage[]
}> {
  try {
    const db = await getDB()
    const storeNames = Array.from(db.objectStoreNames)
    let total = 0
    const breakdown: StoreUsage[] = []

    for (const storeName of storeNames) {
      const tx = db.transaction(storeName, 'readonly')
      const store = tx.objectStore(storeName)
      const allRecords = await store.getAll()
      let storeSize = 0
      for (const record of allRecords) {
        storeSize += calculateObjectSize(record)
      }
      total += storeSize
      breakdown.push({
        name: STORE_DISPLAY_NAMES[storeName] || storeName,
        size: storeSize,
      })
      await tx.done
    }

    breakdown.sort((a, b) => b.size - a.size)
    return { total, breakdown }
  } catch {
    return { total: 0, breakdown: [] }
  }
}

export function useStorageUsage() {
  const [storage, setStorage] = useState<StorageUsage>({
    usage: 0,
    quota: 0,
    indexedDBSize: 0,
    otherSize: 0,
    storeBreakdown: [],
    loading: true,
  })

  const refreshStorage = useCallback(async () => {
    if (!('storage' in navigator)) {
      setStorage((prev) => ({ ...prev, loading: false }))
      return
    }

    try {
      const navStorage = navigator.storage
      const estimate = await navStorage.estimate()
      const usage = estimate.usage ?? 0
      const quota = estimate.quota ?? 0

      const { total: indexedDBSize, breakdown: storeBreakdown } =
        await calculateIndexedDBSize()
      const otherSize = Math.max(0, usage - indexedDBSize)

      setStorage({
        usage,
        quota,
        indexedDBSize,
        otherSize,
        storeBreakdown,
        loading: false,
      })
    } catch {
      setStorage((prev) => ({ ...prev, loading: false }))
    }
  }, [])

  useEffect(() => {
    refreshStorage()
  }, [refreshStorage])

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const percentage =
    storage.quota > 0 ? (storage.usage / storage.quota) * 100 : 0

  return {
    ...storage,
    refreshStorage,
    formatBytes,
    percentage,
  }
}
