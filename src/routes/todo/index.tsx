import { createFileRoute, Link } from '@tanstack/react-router'
import { useMonth } from '#/lib/month-context'
import {
  getTasksByDate,
  getAllTodoCategories,
  reorderTodoTasks,
  deleteTodoTask,
  updateTodoTask,
} from '#/lib/storage'
import { DaySelector } from '#/components/DaySelector'
import { Icon } from '#/components/Icon'
import { useEffect, useState, useCallback, useRef } from 'react'
import type { TodoTask, TodoCategory } from '#/types/todo'
import { getCategoryColor } from '#/types/todo'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'
import { CalendarNav } from '#/components/CalendarNav'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, X } from 'lucide-react'

function SortableTask({
  task,
  category,
  onToggle,
  onDelete,
}: {
  task: TodoTask
  category: TodoCategory | undefined
  onToggle: (task: TodoTask) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-grab active:cursor-grabbing ${
        task.done
          ? 'opacity-60 bg-surface-container-low'
          : 'bg-surface-container-high hover:bg-surface-container-highest'
      } ${isDragging ? 'shadow-2xl scale-[1.02] z-50' : ''}`}
      onClick={() => onToggle(task)}
    >
      <div className="text-outline/40 hover:text-outline cursor-grab active:cursor-grabbing select-none shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </div>

      <div className="flex-1 flex items-center gap-1 min-w-0">
        {category && (
          <span
            className="mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium leading-tight"
            style={{
              backgroundColor: `${getCategoryColor(category.name)}30`,
              color: getCategoryColor(category.name),
            }}
          >
            {category.name}
          </span>
        )}
        <span
          className={`text-sm text-wrap block truncate ${
            task.done
              ? 'line-through text-outline line-through-animate'
              : 'text-on-surface'
          }`}
        >
          {task.name}
        </span>
      </div>

      {task.done ? (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle(task)
          }}
          className="rounded-full p-0.5 bg-on-background shrink-0"
        >
          <Check className="text-black size-4" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task.id)
          }}
          className="rounded-full p-1 active:scale-95 hover:bg-red-500 shrink-0"
        >
          <X className="size-4 text-white" />
        </button>
      )}
    </div>
  )
}

export const Route = createFileRoute('/todo/')({
  component: TodoIndex,
})

function TodoIndex() {
  const { currentMonth } = useMonth()
  const selectedDate = currentMonth.selectedDate
  const [categories, setCategories] = useState<TodoCategory[]>([])
  const [tasks, setTasks] = useState<TodoTask[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'all',
  ])
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    const cats = await getAllTodoCategories()
    setCategories(cats)
    const allTasks = await getTasksByDate(selectedDate)
    setTasks(allTasks)
  }, [selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleTask = async (task: TodoTask) => {
    await updateTodoTask(task.id, { done: !task.done })
    loadData()
  }

  const deleteTask = async (id: string) => {
    await deleteTodoTask(id)
    loadData()
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const filtered = getFilteredTasks()
    const oldIndex = filtered.findIndex((t) => t.id === active.id)
    const newIndex = filtered.findIndex((t) => t.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = [...filtered]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    const allSorted = [...tasks].sort((a, b) => a.priority - b.priority)
    const withoutReordered = allSorted.filter(
      (t) => !reordered.some((r) => r.id === t.id),
    )

    const firstIdx = allSorted.findIndex((t) => t.id === reordered[0]?.id)
    const insertAt = firstIdx >= 0 ? firstIdx : withoutReordered.length

    const newOrder = [
      ...withoutReordered.slice(0, insertAt),
      ...reordered,
      ...withoutReordered.slice(insertAt),
    ]

    await reorderTodoTasks(
      selectedDate,
      newOrder.map((t) => t.id),
    )
    loadData()
  }

  const getFilteredTasks = (taskList: TodoTask[] = tasks) => {
    if (selectedCategories.includes('all')) return taskList
    return taskList.filter((t) => selectedCategories.includes(t.categoryId))
  }

  const handleCategoryToggle = (catId: string) => {
    if (catId === 'all') {
      setSelectedCategories(['all'])
      return
    }
    setSelectedCategories((prev) => {
      const withoutAll = prev.filter((id) => id !== 'all')
      if (withoutAll.includes(catId)) {
        const next = withoutAll.filter((id) => id !== catId)
        return next.length === 0 ? ['all'] : next
      }
      return [...withoutAll, catId]
    })
  }

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -200 : 200,
        behavior: 'smooth',
      })
    }
  }

  const sortedTasks = [...getFilteredTasks()].sort(
    (a, b) => a.priority - b.priority || a.name.localeCompare(b.name),
  )

  const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    },
  )

  const catMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div>
      <TopAppBar showProfile />

      <Page
        className="pb-48"
        title="Todo"
        description="Set and track your todo tasks for the current month."
      >
        <CalendarNav />
        <DaySelector />

        <div className="flex items-center justify-between px-1 mt-4 mb-3">
          <h2 className="text-lg font-bold text-on-surface">Tasks</h2>
          <span className="text-sm text-outline">{dateLabel}</span>
        </div>

        <div className="relative mb-4 group">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth"
          >
            <button
              onClick={() => handleCategoryToggle('all')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                selectedCategories.includes('all')
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-high text-on-surface border-transparent hover:border-primary/50'
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const catColor = getCategoryColor(cat.name)
              const isSelected = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface border-transparent hover:border-primary/50'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: catColor, borderColor: catColor }
                      : { borderColor: `${catColor}50` }
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: catColor }}
                  />
                  {cat.name}
                </button>
              )
            })}
          </div>
          {/* <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <ChevronRight className="size-4" />
          </button> */}
        </div>

        {sortedTasks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedTasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    category={catMap.get(task.categoryId)}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <p className="text-center text-outline py-8 text-sm">
            {selectedCategories.includes('all')
              ? 'No tasks for this day'
              : 'No tasks in selected categories'}
          </p>
        )}

        <div className="fixed bottom-24 right-4 flex flex-col gap-2">
          <Link
            to="/todo/categories"
            className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            <Icon name="category" className="text-secondary" />
          </Link>
          <Link
            to="/todo/add"
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          >
            <Icon name="add" className="text-on-primary" />
          </Link>
        </div>
      </Page>
    </div>
  )
}
