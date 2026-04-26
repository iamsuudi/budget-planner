import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreatePaymentMethod } from '#/hooks/query'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/payment-method/add')({
  component: AddPaymentMethodPage,
})

function AddPaymentMethodPage() {
  const navigate = useNavigate()
  const createPaymentMethod = useCreatePaymentMethod()
  const [name, setName] = useState('')

  const handleSave = () => {
    if (!name.trim()) return

    createPaymentMethod.mutate(
      { name: name.trim() },
      { onSuccess: () => navigate({ to: '/payment-method' }) },
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar showProfile />

      <Page>
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/payment-method"
              className="text-secondary material-symbols-outlined hover:text-cyan-400 transition-colors"
            >
              arrow_back
            </Link>
            <span className="text-secondary text-sm uppercase tracking-widest">
              Settings
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Add Payment Method</h1>
          <p className="text-slate-400 text-sm mt-1">
            Add a new payment method.
          </p>
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
            disabled={!name.trim() || createPaymentMethod.isPending}
            className="py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPaymentMethod.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            to="/payment-method"
            className="py-3 border border-secondary text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/5 transition-all active:scale-95 text-center"
          >
            Cancel
          </Link>
        </div>

        <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -z-10" />
        <div className="fixed -top-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />
      </Page>
    </div>
  )
}
