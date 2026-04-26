import { createFileRoute, Link } from '@tanstack/react-router'
import { PlusCircle, CreditCard, Edit2, Trash2 } from 'lucide-react'
import { useGetPaymentMethods, useDeletePaymentMethod } from '#/hooks/query'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/settings/payment-method/')({
  component: PaymentMethodPage,
})

function PaymentMethodPage() {
  const { data: methods = [], isLoading } = useGetPaymentMethods()
  const deletePaymentMethod = useDeletePaymentMethod()

  const handleDelete = (id: string) => {
    if (confirm('Delete this payment method?')) {
      deletePaymentMethod.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopAppBar title="Payment Methods" backTo="/settings" />

      <Page>
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your payment methods.
          </p>
        </header>

        <div className="mb-4">
          <Link
            to="/settings/payment-method/add"
            className="bg-primary-container text-on-primary-container py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Method
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : methods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">No payment methods yet.</p>
            <Link
              to="/settings/payment-method/add"
              className="text-secondary hover:underline text-sm"
            >
              Add Payment Method
            </Link>
          </div>
        ) : (
          <section className="flex flex-col gap-2">
            {methods.map((method) => (
              <div
                key={method.id}
                className="glass-card flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-on-surface">
                    {method.name}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link
                    to={`/settings/payment-method/edit/$id`}
                    params={{ id: method.id }}
                    className="p-1 text-slate-500 hover:text-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-1 text-slate-500 hover:text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </Page>
    </div>
  )
}
