import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { TopAppBar, BottomNavBar } from '../../components/ui'
import { getAllCategories, deleteCategory } from '../../lib/storage'
import { getIconStyle } from '../../lib/icons'
import type { ExpenseCategory } from '../../types'

export const Route = createFileRoute('/expense-category/')({
  component: ExpenseCategoryPage,
})

const navItems = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  {
    icon: 'category',
    label: 'Categories',
    to: '/expense-category',
    active: true,
  },
  { icon: 'person', label: 'Profile', to: '/profile' },
]

function ExpenseCategoryPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await getAllCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id)
      loadCategories()
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar showProfile />

      <main className="pt-24 px-6 max-w-7xl mx-auto pb-32">
        <section className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Manage Categories
            </h2>
            <p className="text-slate-400">Organize your spending categories.</p>
          </div>
          <Link
            to="/expense-category/add"
            className="bg-primary-container text-on-primary-container py-3 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add New Category
          </Link>
        </section>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 mb-4">
              No categories yet. Create your first category!
            </p>
            <Link
              to="/expense-category/add"
              className="text-secondary hover:underline"
            >
              Add Category
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const styles = getIconStyle(category.icon)
              return (
                <div
                  key={category.id}
                  className="glass-card p-6 rounded-xl flex flex-col justify-between group hover:border-violet-500/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${styles.bg} p-3 rounded-lg border ${styles.border}`}
                    >
                      <span
                        className={`material-symbols-outlined text-3xl ${styles.color}`}
                      >
                        {category.icon}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to={`/expense-category/edit/$id`}
                        params={{ id: category.id }}
                        className="p-2 text-slate-500 hover:text-secondary transition-colors"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-slate-500 hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {category.name}
                    </h3>
                  </div>
                </div>
              )
            })}
            <Link
              to="/expense-category/add"
              className="border-2 border-dashed border-slate-800 p-6 rounded-xl flex flex-col items-center justify-center gap-4 group hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-slate-600 group-hover:text-violet-400">
                  add
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm text-slate-500 block">
                  Create Category
                </span>
              </div>
            </Link>
          </div>
        )}
      </main>

      <BottomNavBar items={navItems} />
    </div>
  )
}
