import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  useGetCategoryById,
  useUpdateCategory,
  useDeleteCategory,
} from '#/hooks/query'
import { AVAILABLE_ICONS, getIconStyle } from '#/lib/icons'
import { BottomNavBar } from '#/components/BottomNavBar'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { Icon } from '#/components/Icon'

export const Route = createFileRoute('/expense-category/edit/$id')({
  component: EditCategoryPage,
})

function EditCategoryPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: category, isLoading } = useGetCategoryById(id)
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('restaurant')

  useEffect(() => {
    if (category) {
      setName(category.name)
      setSelectedIcon(category.icon)
    }
  }, [category])

  const handleSave = () => {
    if (!name.trim() || !id) return

    updateCategory.mutate(
      { id, updates: { name: name.trim(), icon: selectedIcon } },
      { onSuccess: () => navigate({ to: '/expense-category' }) },
    )
  }

  const handleDelete = () => {
    deleteCategory.mutate(id, {
      onSuccess: () => navigate({ to: '/expense-category' }),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <TopAppBar showProfile />
        <Page>
          <p className="text-slate-500">Category not found.</p>
          <Link
            to="/expense-category"
            className="text-secondary hover:underline mt-4 block text-sm"
          >
            Back to Categories
          </Link>
        </Page>
        <BottomNavBar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar showProfile />

      <Page>
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/expense-category"
              className="text-secondary hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-secondary text-sm uppercase tracking-widest">
              Budgeting
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Edit Category</h1>
          <p className="text-slate-400 text-sm mt-1">Update category details.</p>
        </header>

        <div className="glass-panel rounded-xl p-4 space-y-4">
          <section className="space-y-2">
            <div className="space-y-2">
              <label className="text-sm text-violet-400">Category Name</label>
              <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2">
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                  placeholder="e.g., Food"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-violet-400">Icon</label>
              <span className="text-xs text-slate-500 capitalize">
                {selectedIcon}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS.map((icon) => {
                const styles = getIconStyle(icon)
                return (
                  <button
                    key={icon}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                      selectedIcon === icon
                        ? `${styles.bg} border ${styles.border} ${styles.color} electric-glow`
                        : 'glass-panel hover:bg-white/10 text-slate-400 border border-transparent'
                    }`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    <Icon name={icon} className="w-5 h-5" size={20} />
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={!name.trim() || updateCategory.isPending}
            className="py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateCategory.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
            className="py-3 bg-error-container text-error rounded-xl text-sm font-semibold hover:bg-error/10 transition-all active:scale-95"
          >
            {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -z-10" />
        <div className="fixed -top-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />
      </Page>

      <BottomNavBar />
    </div>
  )
}