import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  useGetPaymentMethodById,
  useUpdatePaymentMethod,
  useDeletePaymentMethod,
} from '#/hooks/query'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/payment-method/edit/$id')({
  component: EditPaymentMethodPage,
})

function EditPaymentMethodPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: method, isLoading } = useGetPaymentMethodById(id)
  const updatePaymentMethod = useUpdatePaymentMethod()
  const deletePaymentMethod = useDeletePaymentMethod()
  const [name, setName] = useState('')

  useEffect(() => {
    if (method) {
      setName(method.name)
    }
  }, [method])

  const handleSave = () => {
    if (!name.trim() || !id) return

    updatePaymentMethod.mutate(
      { id, updates: { name: name.trim() } },
      { onSuccess: () => navigate({ to: '/payment-method' }) },
    )
  }

  const handleDelete = () => {
    deletePaymentMethod.mutate(id, {
      onSuccess: () => navigate({ to: '/payment-method' }),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!method) {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <TopAppBar showProfile />
        <Page>
          <p className="text-slate-500">Payment method not found.</p>
          <Link
            to="/payment-method"
            className="text-secondary hover:underline mt-4 block text-sm"
          >
            Back to Payment Methods
          </Link>
        </Page>
      </div>
    )
  }

  return (
    <div className="">
      <TopAppBar showProfile />

      <Page>
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/payment-method"
              className="text-secondary hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-secondary text-sm uppercase tracking-widest">
              Settings
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Edit Payment Method</h1>
          <p className="text-slate-400 text-sm mt-1">Update payment details.</p>
        </header>

        <div className="glass-panel rounded-xl p-4 space-y-4">
          <section className="space-y-2">
            <div className="space-y-2">
              <label className="text-sm text-violet-400">
                Payment Method Name
              </label>
              <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-3 py-2">
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                  placeholder="e.g., Visa"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={!name.trim() || updatePaymentMethod.isPending}
            className="py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatePaymentMethod.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deletePaymentMethod.isPending}
            className="py-3 bg-error-container text-error rounded-xl text-sm font-semibold hover:bg-error/10 transition-all active:scale-95"
          >
            {deletePaymentMethod.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
        <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -z-10" />
        <div className="fixed -top-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />
      </Page>
    </div>
  )
}
