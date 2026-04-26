import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getPaymentMethodById, updatePaymentMethod } from '#/lib/storage'
import { BottomNavBar } from '#/components/BottomNavBar'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/payment-method/edit/$id')({
  component: EditPaymentMethodPage,
})

const navItems = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'account_circle', label: 'Profile', to: '/profile' },
  { icon: 'settings', label: 'Settings', to: '/settings', active: true },
]

function EditPaymentMethodPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPaymentMethod()
  }, [id])

  async function loadPaymentMethod() {
    if (!id) return
    try {
      const method = await getPaymentMethodById(id)
      if (method) {
        setName(method.name)
      }
    } catch (error) {
      console.error('Failed to load payment method:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!name.trim() || !id) return

    setSaving(true)
    try {
      await updatePaymentMethod(id, { name: name.trim() })
      navigate({ to: '/payment-method' })
    } catch (error) {
      console.error('Failed to update payment method:', error)
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
          <p className="text-slate-500">Payment method not found.</p>
          <Link
            to="/payment-method"
            className="text-secondary hover:underline mt-4 block"
          >
            Back to Payment Methods
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
              to="/payment-method"
              className="text-secondary material-symbols-outlined hover:text-cyan-400 transition-colors"
            >
              arrow_back
            </Link>
            <span className="text-secondary text-sm uppercase tracking-widest">
              Settings
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white">Edit Payment Method</h1>
          <p className="text-slate-400 mt-2">Update payment method details.</p>
        </header>

        <div className="glass-panel rounded-xl p-6 space-y-6">
          <section className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-violet-400">
                Payment Method Name
              </label>
              <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-4 py-3">
                <input
                  className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                  placeholder="e.g., Visa ending 4242"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
            to="/payment-method"
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
