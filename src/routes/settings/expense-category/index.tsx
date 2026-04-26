import { createFileRoute, Link } from '@tanstack/react-router'
import { PlusCircle, Edit2, Trash2, Plus } from 'lucide-react'
import { useGetCategories, useDeleteCategory } from '#/hooks/query'
import { getIconStyle } from '#/lib/icons'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { Icon } from '#/components/Icon'

export const Route = createFileRoute('/settings/expense-category/')({
  component: ExpenseCategoryPage,
})

function ExpenseCategoryPage() {
  const { data: categories = [], isLoading } = useGetCategories()
  const deleteCategory = useDeleteCategory()

  const handleDelete = (id: string) => {
    if (confirm('Delete this category?')) {
      deleteCategory.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar title="Expense Categories" showBack backTo="/settings" />

      <Page>
        <section className="flex justify-between items-center mb-6 gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Categories</h2>
            <p className="text-slate-400 text-sm">Organize spending.</p>
          </div>
          <Link
            to="/settings/expense-category/add"
            className="bg-primary-container text-on-primary-container py-2 px-4 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add
          </Link>
        </section>

        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">No categories yet.</p>
            <Link
              to="/settings/expense-category/add"
              className="text-secondary hover:underline text-sm"
            >
              Add Category
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const styles = getIconStyle(category.icon)
              return (
                <div
                  key={category.id}
                  className="glass-card p-4 rounded-lg flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`${styles.bg} p-2 rounded-lg border ${styles.border}`}
                    >
                      <Icon
                        name={category.icon}
                        className={styles.color}
                        size={20}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to={`/settings/expense-category/edit/$id`}
                        params={{ id: category.id }}
                        className="p-1 text-slate-500 hover:text-secondary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1 text-slate-500 hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {category.name}
                    </h3>
                  </div>
                </div>
              )
            })}
            <Link
              to="/settings/expense-category/add"
              className="border-2 border-dashed border-slate-800 p-4 rounded-lg flex flex-col items-center justify-center gap-2 group hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer min-h-[100px]"
            >
              <Plus className="w-6 h-6 text-slate-600 group-hover:text-violet-400" />
              <span className="text-xs text-slate-500">Add</span>
            </Link>
          </div>
        )}
      </Page>
    </div>
  )
}
