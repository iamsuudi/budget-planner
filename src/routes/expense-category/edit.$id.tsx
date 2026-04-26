import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getCategoryById, updateCategory } from '#/lib/storage'
import { AVAILABLE_ICONS, getIconStyle } from '#/lib/icons'
import { BottomNavBar } from '#/components/BottomNavBar'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/expense-category/edit/$id')({
  component: EditCategoryPage,
})

function EditCategoryPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('restaurant')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadCategory()
  }, [id])

  async function loadCategory() {
    if (!id) return
    try {
      const category = await getCategoryById(id)
      if (category) {
        setName(category.name)
        setSelectedIcon(category.icon)
      }
    } catch (error) {
      console.error('Failed to load category:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!name.trim() || !id) return

    setSaving(true)
    try {
      await updateCategory(id, { name: name.trim(), icon: selectedIcon })
      navigate({ to: '/expense-category' })
    } catch (error) {
      console.error('Failed to update category:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!name) {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <TopAppBar showProfile />
        <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
          <p className="text-slate-500">Category not found.</p>
          <Link
            to="/expense-category"
            className="text-secondary hover:underline mt-4 block"
          >
            Back to Categories
          </Link>
        </main>
        <BottomNavBar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar showProfile />

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/expense-category"
              className="text-secondary material-symbols-outlined hover:text-cyan-400 transition-colors"
            >
              arrow_back
            </Link>
            <span className="text-secondary text-sm uppercase tracking-widest">
              Budgeting
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Edit Category</h1>
          <p className="text-slate-400 mt-2">Update category details.</p>
        </header>

        <div className="glass-panel rounded-xl p-6 space-y-6">
          <section className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-violet-400">Category Name</label>
              <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-4 py-3">
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                  placeholder="e.g., Entertainment"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-violet-400">Icon</label>
              <span className="text-xs text-slate-500 capitalize">
                Selected: {selectedIcon}
              </span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
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
                    <span className="material-symbols-outlined">{icon}</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="w-full sm:w-auto px-10 py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            to="/expense-category"
            className="w-full sm:w-auto px-10 py-3 border border-secondary text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/5 transition-all active:scale-95 text-center"
          >
            Cancel
          </Link>
        </div>

        <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] -z-10" />
        <div className="fixed -top-32 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10" />
      </main>

      <BottomNavBar />
    </div>
  )
}
