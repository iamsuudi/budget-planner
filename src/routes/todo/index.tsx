import { createFileRoute, Link } from '@tanstack/react-router'
import { useMonth } from '#/lib/month-context'
import {
  getTasksByDate,
  getAllTodoCategories,
  reorderTodoTasks,
} from '#/lib/storage'
import { DaySelector } from '#/components/DaySelector'
import { GlassCard } from '#/components/GlassCard'
import { Icon } from '#/components/Icon'
import { useEffect, useState, useCallback } from 'react'
import type { TodoTask, TodoCategory } from '#/types/todo'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'
import { CalendarNav } from '#/components/CalendarNav'

export const Route = createFileRoute('/todo/')({
  component: TodoIndex,
})

function TodoIndex() {
  const { currentMonth } = useMonth()
  const selectedDate = currentMonth.selectedDate
  const [categories, setCategories] = useState<TodoCategory[]>([])
  const [tasksByCategory, setTasksByCategory] = useState<
    Record<string, TodoTask[]>
  >({})
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragCatId, setDragCatId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const cats = await getAllTodoCategories()
    setCategories(cats)
    const allTasks = await getTasksByDate(selectedDate)
    const grouped: Record<string, TodoTask[]> = {}
    for (const task of allTasks) {
      if (!grouped[task.categoryId]) grouped[task.categoryId] = []
      grouped[task.categoryId].push(task)
    }
    setTasksByCategory(grouped)
  }, [selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleTask = async (task: TodoTask) => {
    const { updateTodoTask } = await import('#/lib/storage')
    await updateTodoTask(task.id, { done: !task.done })
    loadData()
  }

  const deleteTask = async (id: string) => {
    const { deleteTodoTask } = await import('#/lib/storage')
    await deleteTodoTask(id)
    loadData()
  }

  const handleDragStart = (catId: string, index: number) => {
    setDragIndex(index)
    setDragCatId(catId)
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = async (catId: string, dropIndex: number) => {
    if (dragIndex === null || dragCatId !== catId) return
    const catTasks = [...(tasksByCategory[catId] || [])]
    const [moved] = catTasks.splice(dragIndex, 1)
    catTasks.splice(dropIndex, 0, moved)
    setTasksByCategory((prev) => ({ ...prev, [catId]: catTasks }))
    setDragIndex(null)
    setDragCatId(null)
    await reorderTodoTasks(
      catId,
      selectedDate,
      catTasks.map((t) => t.id),
    )
  }

  const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString(
    'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    },
  )

  const totalTasks = Object.values(tasksByCategory).reduce(
    (a, b) => a + b.length,
    0,
  )

  return (
    <div className="">
      <TopAppBar showProfile />

      <Page
        className="pb-48"
        title="Todo"
        description="Set and track your todo tasks for the current month."
      >
        <CalendarNav />

        <DaySelector />

        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-on-surface">Tasks</h2>
          <span className="text-sm text-outline">{dateLabel}</span>
        </div>

        {categories.map((cat) => {
          const catTasks = tasksByCategory[cat.id] || []
          if (catTasks.length === 0) return null
          return (
            <GlassCard key={cat.id} className="p-4">
              <h3 className="text-sm font-semibold text-primary-container mb-2">
                {cat.name}
              </h3>
              <div className="space-y-1">
                {catTasks.map((task, index) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(cat.id, index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(cat.id, index)}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all cursor-grab active:cursor-grabbing ${
                      dragIndex === index && dragCatId === cat.id
                        ? 'opacity-50'
                        : ''
                    } ${task.done ? 'opacity-60' : 'hover:bg-surface-container-high'}`}
                    onClick={() => toggleTask(task)}
                  >
                    <button
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        task.done
                          ? 'bg-primary border-primary'
                          : 'border-outline hover:border-primary'
                      }`}
                    >
                      {task.done && (
                        <Icon
                          name="check"
                          size={12}
                          className="text-on-primary"
                        />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${task.done ? 'line-through text-outline line-through-animate' : 'text-on-surface'}`}
                    >
                      {task.name}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="rounded-full cursor-pointer p-1 hover:bg-error-container shrink-0"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          )
        })}

        {totalTasks === 0 && (
          <p className="text-center text-outline py-8 text-sm">
            No tasks for this day
          </p>
        )}

        <div className="fixed bottom-24 right-4 flex flex-col gap-2">
          <Link
            to="/todo/categories"
            className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Icon name="category" className="text-secondary" />
          </Link>
          <Link
            to="/todo/add"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer"
          >
            <Icon name="add" className="text-on-primary" />
          </Link>
        </div>
      </Page>
    </div>
  )
}
