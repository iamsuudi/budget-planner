import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getAllPaymentMethods, deletePaymentMethod } from '#/lib/storage'
import type { PaymentMethod } from '#/types'
import { BottomNavBar } from '#/components/BottomNavBar'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/payment-method/')({
  component: PaymentMethodPage,
})

function PaymentMethodPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMethods()
  }, [])

  async function loadMethods() {
    try {
      const data = await getAllPaymentMethods()
      setMethods(data)
    } catch (error) {
      console.error('Failed to load payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this payment method?')) {
      await deletePaymentMethod(id)
      loadMethods()
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopAppBar showProfile />

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/settings"
              className="text-secondary material-symbols-outlined hover:text-cyan-400 transition-colors"
            >
              arrow_back
            </Link>
            <span className="text-secondary text-sm uppercase tracking-widest">
              Settings
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Payment Methods</h1>
          <p className="text-slate-400 mt-2">
            Manage your payment methods for tracking expenses.
          </p>
        </header>

        <div className="mb-6">
          <Link
            to="/payment-method/add"
            className="bg-primary-container text-on-primary-container py-3 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add New Payment Method
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading...</div>
        ) : methods.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 mb-4">No payment methods yet.</p>
            <Link
              to="/payment-method/add"
              className="text-secondary hover:underline"
            >
              Add Payment Method
            </Link>
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            {methods.map((method) => (
              <div
                key={method.id}
                className="glass-card flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <span className="material-symbols-outlined">
                      credit_card
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {method.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link
                    to={`/payment-method/edit/$id`}
                    params={{ id: method.id }}
                    className="p-2 text-slate-500 hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-2 text-slate-500 hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <BottomNavBar />
    </div>
  )
}
