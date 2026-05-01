# Storage Documentation

## Overview

Budget Manager uses **IndexedDB** as the primary storage mechanism via the `idb` library wrapper. The app is a PWA with offline-first architecture — all data persists locally in the browser.

## Database Structure

**Database Name**: `budget-manager`
**Current Version**: 7

### Object Stores

| Store Name | Description | Key Path | Indexes |
|------------|-------------|----------|---------|
| `user` | User profile data | `id` | — |
| `wallets` | User wallets/accounts | `id` | `by-deleted` (deletedAt) |
| `expenseCategories` | Expense categories | `id` | `by-deleted` (deletedAt) |
| `salaryCategories` | Income/salary categories | `id` | `by-deleted` (deletedAt) |
| `invoices` | Expense invoices | `id` | `by-date` (date) |
| `monthBudgets` | Monthly budget limits | `id` | `by-month` (monthId) |
| `todoCategories` | Todo list categories | `id` | `by-deleted` (deletedAt) |
| `todoTasks` | Todo tasks | `id` | `by-category` (categoryId), `by-date` (date) |
| `notes` | Rich text notes | `id` | `by-deleted` (deletedAt) |

### Schema Evolution

The database uses incremental versioning:

```
Version 1: expenseCategories, invoices, monthBudgets
Version 2: + user, wallets
Version 3: - paymentMethods (removed)
Version 5: + salaryCategories
Version 6: + todoCategories, todoTasks
Version 7: + notes
```

**File**: `src/lib/storage/db.ts`

## Storage Implementation

### Core Database Module

```typescript
// src/lib/storage/db.ts
import { openDB } from 'idb'

export interface BudgetManagerDB extends DBSchema {
  user: { key: string; value: User }
  wallets: { key: string; value: Wallet; indexes: { 'by-deleted': number } }
  // ... other stores
}

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<BudgetManagerDB>('budget-manager', 7, {
      upgrade(db, oldVersion) { /* migration logic */ }
    })
  }
  return dbPromise
}
```

### Data Access Modules

Each domain has its own storage module in `src/lib/storage/`:

| Module | Stores Used | Key Functions |
|--------|-------------|---------------|
| `user.ts` | `user`, `wallets` | `saveUser`, `getUser`, `addWallet`, `updateWallet`, `deleteWallet` |
| `expense-categories.ts` | `expenseCategories` | `addExpenseCategory`, `updateExpenseCategory`, `deleteExpenseCategory` |
| `salary-categories.ts` | `salaryCategories` | `addSalaryCategory`, `updateSalaryCategory`, `deleteSalaryCategory` |
| `invoices.ts` | `invoices` | `addInvoice`, `updateInvoice`, `deleteInvoice`, `getInvoicesByDate` |
| `budgets.ts` | `monthBudgets` | `setMonthBudget`, `getMonthBudget` |
| `todos.ts` | `todoCategories`, `todoTasks` | `addCategory`, `addTask`, `updateTask`, `toggleTask` |
| `notes.ts` | `notes` | `addNote`, `updateNote`, `deleteNote` |

**Pattern**: All modules use `db.put(storeName, record)` for upserts and软删除 via `deletedAt` timestamp.

### Soft Deletes

Most entities support soft deletes using `deletedAt` field:

```typescript
// Mark as deleted
await db.put('wallets', { ...existing, deletedAt: Date.now() })

// Query non-deleted
const tx = db.transaction('wallets')
const index = tx.store.index('by-deleted')
const active = await index.getAll(IDBKeyRange.only(undefined))
```

## Storage Usage Tracking

### Hook: `useStorageUsage`

**File**: `src/hooks/useStorageUsage.tsx`

Provides real-time storage metrics:

```typescript
const {
  usage,           // Total origin usage (from navigator.storage.estimate())
  quota,           // Total available quota
  indexedDBSize,   // Calculated IndexedDB size
  otherSize,       // Other storage (Cache API, localStorage, etc.)
  storeBreakdown,  // Per-store size breakdown
  loading,         // Loading state
  percentage,      // Usage percentage of quota
  formatBytes,     // Utility to format bytes
  refreshStorage,  // Manual refresh function
} = useStorageUsage()
```

### How It Works

1. **Total Usage**: Uses `navigator.storage.estimate()` — returns combined origin storage (IndexedDB + Cache API + localStorage)
2. **IndexedDB Size**: Iterates all object stores, serializes records to JSON, and calculates byte length using `TextEncoder`
3. **Other Storage**: Calculated as `total - indexedDBSize`
4. **Per-Store Breakdown**: Sorted by size (largest first) with display names

### Storage Visualization

**Component**: `src/components/StorageBarChart.tsx`

- Color-coded bar chart showing relative store sizes
- Interactive hover tooltips with exact sizes
- Legend with matching colors
- Used in Settings page (`/settings/`) with collapsible details

## Storage Monitoring UI

**File**: `src/routes/settings/index.tsx`

The Settings page displays:

```
Storage Used
├── Total: "2.5 MB of 50 MB" (from navigator.storage.estimate())
├── Refresh button (manual recalculation)
├── Warning badge if >80% used
└── Expandable Details:
    ├── IndexedDB: "2.3 MB"
    ├── Other: "0.2 MB"
    ├── Bar Chart (visual breakdown)
    └── List Breakdown:
        ├── Invoices: 1.2 MB
        ├── Notes: 0.8 MB
        ├── Wallets: 0.3 MB
        ...
```

## Clearing Data

**Function**: `clearAllData()` in `src/lib/storage/db.ts`

```typescript
export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('user')
  await db.clear('wallets')
  await db.clear('expenseCategories')
  // ... clears all stores
}
```

**UI Trigger**: Settings page "Delete Data" button — shows confirmation dialog before clearing.

## ID Generation

**Function**: `generateId()` in `src/lib/storage/db.ts`

```typescript
export async function generateId(): Promise<string> {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
```

Creates unique IDs using timestamp + random string.

## Security Storage

Security settings (PIN, biometric) use a hybrid approach:

| Data | Storage | File |
|------|---------|------|
| PIN hash | `localStorage` (`budget-pin-hash`) | `src/lib/security/local-storage.ts` |
| Biometric settings | `localStorage` (`budget-security-settings`) | `src/lib/security/local-storage.ts` |
| Session auth | `sessionStorage` (`security-auth`) | `src/lib/security/index.tsx` |

**Note**: PIN hashing uses Web Crypto API (`src/lib/security/pin-crypto.ts`).

## Caching Strategy

This app does **not** use Cache API or service worker caching for data. The only caching is:

- **Currency cache**: In-memory cache in `src/lib/currency.ts` (`currencyCache` variable)
- **PWA assets**: Service worker caches static assets (generated by Vite PWA plugin)

## Quota and Limits

- **Origin Storage**: Browsers typically allow 60-80% of available disk space
- **IndexedDB Limits**: Same as origin storage (shared with Cache API, localStorage)
- **Monitoring**: App shows warning when >80% quota is used
- **No explicit quota requests**: The app relies on browser-managed storage

## File Locations Summary

```
src/
├── lib/
│   ├── storage/
│   │   ├── db.ts                    # Database initialization & clearAllData
│   │   ├── user.ts                  # User & wallet operations
│   │   ├── expense-categories.ts    # Expense category operations
│   │   ├── salary-categories.ts     # Salary category operations
│   │   ├── invoices.ts              # Invoice operations
│   │   ├── budgets.ts               # Budget operations
│   │   ├── todos.ts                 # Todo operations
│   │   └── notes.ts                 # Note operations
│   └── security/
│       ├── local-storage.ts         # Security settings in localStorage
│       └── pin-crypto.ts            # PIN hashing
├── hooks/
│   └── useStorageUsage.tsx          # Storage usage tracking hook
├── components/
│   └── StorageBarChart.tsx          # Storage visualization chart
└── routes/
    └── settings/
        └── index.tsx                # Settings page with storage UI
```
