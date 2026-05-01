# Todo List Documentation

## Overview

The Todo List module allows users to create, organize, and prioritize tasks across categories. Tasks are date-based and support drag-and-drop reordering across all categories with a flat list view.

## Architecture

### Data Types

**File**: `src/types/todo.ts`

```typescript
export interface TodoCategory {
  id: string
  name: string
  createdAt: number
  deletedAt?: number  // Soft delete
}

export interface TodoTask {
  id: string
  categoryId: string
  name: string
  date: string           // Format: "YYYY-MM-DD"
  priority: number        // Global priority for the date (0-based index)
  done: boolean
  createdAt: number
  updatedAt: number
}
```

### Category Colors

Colors are dynamically assigned based on category name hashing (no stored color field):

```typescript
export const CATEGORY_COLORS = [
  '#d0bcff', '#4cd7f6', '#4edea3', '#f6a04c', '#f67c4c',
  '#e8526a', '#a36ff6', '#52d6f6', '#f6d852', '#a8e6a3',
]

export function getCategoryColor(name: string): string
```

The same category name always maps to the same color via a simple hash function.

---

## File Structure

```
src/
├── types/
│   └── todo.ts                        # TodoCategory, TodoTask, CATEGORY_COLORS
├── lib/
│   └── storage/
│       └── todos.ts                   # CRUD operations for categories & tasks
├── routes/
│   └── todo/
│       ├── index.tsx                  # Main todo list (drag-drop, filters)
│       ├── add.tsx                    # Add new task form
│       └── categories.tsx             # Category management (CRUD)
└── components/
    ├── DaySelector.tsx                # Day selection for current month
    └── CalendarNav.tsx               # Month navigation
```

---

## Storage (IndexedDB)

**Object Stores** (from `src/lib/storage/db.ts`):

| Store Name | Key | Indexes | Purpose |
|------------|-----|---------|---------|
| `todoCategories` | `id` | `by-deleted` (deletedAt) | Todo categories |
| `todoTasks` | `id` | `by-category` (categoryId), `by-date` (date) | Todo tasks |

### Key Storage Functions

**File**: `src/lib/storage/todos.ts`

| Function | Purpose |
|----------|---------|
| `getAllTodoCategories()` | Get all non-deleted categories, sorted by `createdAt` |
| `addTodoCategory(name)` | Create new category |
| `updateTodoCategory(id, name)` | Update category name |
| `deleteTodoCategory(id)` | Soft delete (sets `deletedAt`) |
| `getTasksByDate(date)` | Get all tasks for a date, sorted by `priority` |
| `getTasksByCategoryAndDate(catId, date)` | Get tasks for specific category + date |
| `addTodoTask(categoryId, name, date)` | Create new task with priority at end of list |
| `updateTodoTask(id, updates)` | Update task fields |
| `deleteTodoTask(id)` | Hard delete task |
| `reorderTodoTasks(date, taskIds)` | Reorder tasks by updating `priority` for all tasks of a date |

### Priority System

- `priority` is a **global zero-based index** for all tasks on a given date
- New tasks get `priority = existingTasks.length` (appended to end)
- After drag-and-drop reordering, ALL tasks for that date get their priorities recalculated
- Sorting: `tasks.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))`

---

## UI Components

### 1. Main Todo List (`/todo/`)

**File**: `src/routes/todo/index.tsx`

**Features**:
- Flat task list (not grouped by category)
- Each task displays: drag handle (⋮⋮), task name, category badge, action button
- **Category badge**: Shown below task name with dynamic color
- **Task states**:
  - *Incomplete*: Shows delete (✕) button
  - *Complete*: Shows check-circle button to undo, task appears dimmed with line-through
- **Drag-and-drop**: Powered by `@dnd-kit/core` and `@dnd-kit/sortable`
  - Cross-category reordering supported (flat list)
  - Visual feedback: opacity change + scale + shadow while dragging
- **Category filter bar**: Horizontal scrollable chips
  - "All" button (default selected)
  - One chip per category with colored dot
  - Multi-select: selecting a category deselects "All"; can select multiple
  - Selecting "All" deselects individual categories
- **Sorting**: By `priority` ascending, then by `name` alphabetically
- **Date navigation**: CalendarNav + DaySelector to pick date

**State**:
```typescript
const [categories, setCategories] = useState<TodoCategory[]>([])
const [tasks, setTasks] = useState<TodoTask[]>([])
const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
```

### 2. Add Task (`/todo/add`)

**File**: `src/routes/todo/add.tsx`

- Select date (from month context)
- Pick category from grid of buttons
- Enter task name
- Submits to `addTodoTask()` then navigates back to `/todo`

### 3. Manage Categories (`/todo/categories`)

**File**: `src/routes/todo/categories.tsx`

- List all categories with edit/delete buttons
- Add new category via input form
- Edit existing category inline (form switches to "Save" mode)
- Delete category (hard delete via `deleteTodoCategory`)
- Colors are dynamically assigned based on name (not stored)

---

## Drag-and-Drop Implementation

**Library**: `@dnd-kit/core`, `@dnd-kit/sortable`

### How It Works

1. Tasks are wrapped in `SortableContext` with `verticalListSortingStrategy`
2. Each task uses `useSortable` hook to become draggable
3. `DndContext` handles the drag session with `PointerSensor` (8px activation distance)
4. On `onDragEnd`:
   - Find old/new indices in the filtered task list
   - Reorder the filtered tasks array
   - Merge reordered tasks back into the full task list at correct positions
   - Call `reorderTodoTasks(date, allTaskIds)` to persist new priority order

### Cross-Category Support

Since the task list is flat (not grouped), dragging works across categories naturally. The `priority` field is global per date, so a task moved between categories maintains correct ordering.

---

## Category Filter Logic

```typescript
const getFilteredTasks = (taskList: TodoTask[] = tasks) => {
  if (selectedCategories.includes('all')) return taskList
  return taskList.filter((t) => selectedCategories.includes(t.categoryId))
}
```

**Selection Rules**:
- Default: `['all']` → shows all tasks
- Click category: deselects 'all', adds category to selection
- Click selected category: removes it; if none left, reverts to 'all'
- Click 'all': clears category selections, sets to `['all']`
- Multiple categories can be selected simultaneously

---

## Styling

**Approach**: Tailwind CSS v4 + custom theme in `src/styles.css`

**Key Classes**:
- Task cards: `bg-surface-container-high hover:bg-surface-container-highest rounded-xl`
- Category badges: inline-block with dynamic `backgroundColor` (30% opacity) and `color`
- Drag handle: `text-outline/40 hover:text-outline cursor-grab`
- Category filter chips: `rounded-full px-4 py-1.5 text-xs` with dynamic background when selected
- Done tasks: `opacity-60 line-through text-outline line-through-animate`

**Color Theme** (from `src/styles.css`):
- Surface: `#0b1326` (dark)
- Primary: `#d0bcff`
- Secondary: `#4cd7f6`
- Surface containers: `#171f33` (low) to `#2d3449` (highest)

---

## Key Files Summary

| File | Purpose |
|------|---------|
| `src/types/todo.ts` | TypeScript interfaces, color utilities |
| `src/lib/storage/todos.ts` | IndexedDB CRUD operations |
| `src/routes/todo/index.tsx` | Main list with DnD, filtering, sorting |
| `src/routes/todo/add.tsx` | Add task form |
| `src/routes/todo/categories.tsx` | Category CRUD management |
| `src/styles.css` | Global styles and theme |
