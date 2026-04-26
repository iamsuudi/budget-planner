# Budget Manager - Architecture Overview

A React-based budget management application using TanStack Router, IndexedDB for offline storage, and Tailwind CSS.

## Tech Stack

- **Framework**: React 19 + TanStack Router
- **Styling**: Tailwind CSS v4
- **Storage**: IndexedDB via `idb` library
- **Build**: Vite

## Project Structure

```
src/
├── components/ui/          # Reusable UI components
│   ├── BottomNavBar.tsx    # Navigation bar with active states
│   ├── TopAppBar.tsx       # Header with logo and profile
│   ├── GlassCard.tsx       # Glassmorphism card container
│   ├── ProgressBar.tsx     # Budget progress indicator
│   ├── TransactionItem.tsx
│   ├── CategoryCard.tsx
│   ├── ActionListItem.tsx
│   ├── ToggleSwitch.tsx
│   └── IconButton.tsx
│
├── lib/                    # Core utilities
│   ├── storage.ts          # IndexedDB operations
│   ├── icons.ts            # Icon definitions and styles
│   ├── month-context.tsx  # Global month state management
│   └── index.ts
│
├── routes/                 # TanStack Router pages
│   ├── index.tsx           # Home page (/)
│   ├── reports/           # Reports page (/reports)
│   ├── profile/           # Profile page (/profile)
│   ├── settings/          # Settings page (/settings)
│   ├── expense/           # Add expense (/expense/add)
│   ├── expense-category/   # Category management
│   │   ├── index.tsx       # List categories
│   │   ├── add.tsx         # Add category
│   │   └── edit.tsx       # Edit category
│   ├── payment-method/     # Payment methods
│   │   ├── index.tsx
│   │   ├── add.tsx
│   │   └── edit.tsx
│   └── budget/             # Set monthly budget
│       └── index.tsx
│
├── types/                  # TypeScript type definitions
│   ├── expense.ts         # ExpenseCategory
│   ├── payment-method.ts  # PaymentMethod
│   ├── invoice.ts          # Invoice
│   └── month.ts           # Month, MonthBudget
│
├── styles.css             # Global styles + Tailwind config
└── main.tsx              # App entry point
```

## Data Layer

### IndexedDB Stores

1. **expenseCategories**
   - `id`: string (unique)
   - `name`: string
   - `icon`: string
   - `createdAt`: number (timestamp)
   - `deletedAt`: number | undefined (soft delete)

2. **paymentMethods**
   - `id`: string
   - `name`: string
   - `createdAt`: number
   - `deletedAt`: number | undefined

3. **invoices** (expenses)
   - `id`: string
   - `amount`: number
   - `date`: ISO string
   - `categoryId`: string
   - `categoryName`: string (denormalized for history)
   - `paymentMethodId`: string
   - `paymentMethodName`: string
   - `note`: string | undefined
   - `createdAt`: number
   - `updatedAt`: number

4. **monthBudgets**
   - `id`: string
   - `monthId`: string (e.g., "2024-10")
   - `year`: number
   - `number`: number (1-12)
   - `totalBudget`: number
   - `categoryBudgets`: Record<string, number>
   - `createdAt`: number
   - `updatedAt`: number

## Global State

### Month Context (`month-context.tsx`)

Provides centralized month navigation across the app:

```typescript
interface MonthContextType {
  currentMonth: { year: number; month: number; monthName: string }
  setCurrentMonth: (year: number, month: number) => void
  goToPrevMonth: () => void
  goToNextMonth: () => void
  isCurrentMonth: (year: number, month: number) => boolean
}
```

- Default: Current month on app load
- Persists during session (resets on reload)
- All pages can access current month via `useMonth()` hook

Icon Styles (`icons.ts`)

```
AVAILABLE_ICONS: string[]
getIconStyle(icon: string): { bg, border, color }
```

## Page Flow

### Home (`/`)
- Shows expenses for current month
- Navigation arrows to change month
- Two action buttons:
  - **Add Expense** → `/expense/add`
  - **Set Budget** → `/budget`

### Add Expense (`/expense/add`)
- Select category (from expenseCategories)
- Enter amount
- Select payment method
- Optional note

### Set Budget (`/budget`)
- Set total monthly budget
- Optionally set per-category budgets
- Shows spending per category

### Reports (`/reports`)
- Monthly analytics
- Category spending breakdown
- Budget health strategy

### Expense Categories (`/expense-category`)
- CRUD for categories
- Each category has name + icon

### Payment Methods (`/payment-method`)
- CRUD for payment methods
- Simple name only

### Settings (`/settings`)
- Links to Payment Methods
- Links to Expense Categories
- App preferences (toggles)

## Design System

### Colors
- Primary: Violet (#d0bcff)
- Secondary: Cyan (#4cd7f6)
- Tertiary: Emerald (#4edea3)
- Background: Deep Navy (#0b1326)

### Components
- Glass cards with backdrop blur
- Glow effects on hover/active
- Material Symbols Outlined icons

## Adding New Pages

1. Create route file in `src/routes/[page]/index.tsx`
2. Export route with `createFileRoute('/path')`
3. Use existing components from `components/ui`
4. Use storage functions from `lib/storage`
5. Add to bottom nav in relevant pages

## Storage Pattern

```typescript
// Get all (excludes soft-deleted)
const items = await db.getAllStore('storeName')
return items.filter(item => !item.deletedAt)

// Soft delete
await db.put('storeName', { ...item, deletedAt: Date.now() })
```

## Key Files

- `src/routes/__root.tsx` - Root with MonthProvider
- `src/lib/storage.ts` - All IndexedDB operations
- `src/lib/month-context.tsx` - Global month state
- `src/lib/icons.ts` - Icon system