import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useMonth } from '#/lib/month-context'
import { getAllTodoCategories, addTodoTask } from '#/lib/storage'
import { GlassCard } from '#/components/GlassCard'
import type { TodoCategory } from '#/types/todo'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'

export const Route = createFileRoute('/todo/add')({
  component: TodoAdd,
})

function TodoAdd() {
  const { currentMonth } = useMonth()
  const selectedDate = currentMonth.selectedDate
  const [categories, setCategories] = useState<TodoCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [taskName, setTaskName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getAllTodoCategories().then((cats) => {
      setCategories(cats)
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0].id)
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskName.trim() || !selectedCategory) return
    await addTodoTask(selectedCategory, taskName.trim(), selectedDate)
    navigate({ to: '/todo' })
  }

  const dateLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString(
    'en-US',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  )

  return (
    <div className="space-y-4 pb-20">
      <TopAppBar showBack backTo="/todo" />

      <Page className="space-y-6">
        <h2 className="text-lg font-bold text-on-surface">Add Task</h2>

        <GlassCard className="p-4 space-y-4">
          <div>
            <p className="text-sm text-outline mb-1">Date</p>
            <p className="text-on-surface font-medium">{dateLabel}</p>
          </div>

          <div>
            <p className="text-sm text-outline mb-2">Category</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors cursor-pointer active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-high text-on-surface hover:bg-primary/20'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="text-sm text-outline text-center py-2">
                No categories.{' '}
                <Link to="/todo/categories" className="text-primary underline">
                  Create one
                </Link>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm text-outline mb-1 block">
                Task Name
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!taskName.trim() || !selectedCategory}
              className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              Add Task
            </button>
          </form>
        </GlassCard>
      </Page>
    </div>
  )
}
