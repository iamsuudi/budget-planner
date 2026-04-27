import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useCreatePaymentMethod } from '#/hooks/query'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'
import { CancelButton } from '#/components/CancelButton'

export const Route = createFileRoute('/settings/payment-method/add')({
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
      { onSuccess: () => navigate({ to: '/settings/payment-method' }) },
    )
  }

  return (
    <div className="">
      <TopAppBar
        title="Payment Method"
        showBack
        backTo={'/settings/payment-method'}
      />

      <Page className="space-y-6">
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

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={!name.trim() || createPaymentMethod.isPending}
            className="py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPaymentMethod.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <CancelButton to="/settings/payment-method" />
        </div>

        <div className="fixed -bottom-32 -left-32 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -z-10" />
        <div className="fixed -top-32 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-10" />
      </Page>
    </div>
  )
}
