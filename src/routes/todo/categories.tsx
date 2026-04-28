import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  getAllTodoCategories,
  addTodoCategory,
  updateTodoCategory,
  deleteTodoCategory,
} from '#/lib/storage'
import { GlassCard } from '#/components/GlassCard'
import { Icon } from '#/components/Icon'
import type { TodoCategory } from '#/types/todo'
import { TopAppBar } from '#/components/TopAppBar'
import { Page } from '#/components/Page'

export const Route = createFileRoute('/todo/categories')({
  component: TodoCategories,
})

function TodoCategories() {
  const [categories, setCategories] = useState<TodoCategory[]>([])
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = async () => {
    const cats = await getAllTodoCategories()
    setCategories(cats)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (editingId) {
      await updateTodoCategory(editingId, name.trim())
      setEditingId(null)
    } else {
      await addTodoCategory(name.trim())
    }
    setName('')
    load()
  }

  const handleEdit = (cat: TodoCategory) => {
    setName(cat.name)
    setEditingId(cat.id)
  }

  const handleDelete = async (id: string) => {
    await deleteTodoCategory(id)
    load()
  }

  return (
    <div className="space-y-4 pb-20">
      <TopAppBar showBack backTo="/todo" />

      <Page
        title="Categories"
        description="Set and manage your todo categories."
      >
        <GlassCard className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-3 py-2 rounded-lg bg-surface-container border border-outline/30 text-on-surface text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium"
            >
              {editingId ? 'Save' : 'Add'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setName('')
                }}
                className="px-4 py-2 bg-surface-container-high rounded-lg text-sm"
              >
                Cancel
              </button>
            )}
          </form>

          <div className="space-y-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high"
              >
                <span className="text-sm text-on-surface">{cat.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 hover:bg-surface-container rounded"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-error-container rounded"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-outline py-4 text-sm">
                No categories yet
              </p>
            )}
          </div>
        </GlassCard>
      </Page>
    </div>
  )
}
