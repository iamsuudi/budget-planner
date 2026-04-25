import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { TopAppBar, BottomNavBar, GlassCard } from '../../components/ui'

export const Route = createFileRoute('/expense-category/add')({
  component: AddCategoryPage,
})

const availableIcons = [
  'restaurant', 'shopping_cart', 'flight', 'home', 'fitness_center',
  'directions_car', 'medical_services', 'school', 'pets', 'spa',
  'celebration', 'movie', 'theater_comedy', 'sports_esports', 'music_note',
  'local_cafe', 'local_grocery_store', 'checkroom', 'dry_cleaning', 'wifi',
]

const accentColors = [
  { name: 'violet', class: 'bg-violet-500', ring: 'ring-violet-500' },
  { name: 'cyan', class: 'bg-secondary', ring: 'ring-secondary' },
  { name: 'emerald', class: 'bg-tertiary', ring: 'ring-tertiary' },
  { name: 'red', class: 'bg-error', ring: 'ring-error' },
  { name: 'purple', class: 'bg-primary-container', ring: 'ring-primary-container' },
]

const navItems = [
  { icon: 'home', label: 'Home', to: '/' },
  { icon: 'insights', label: 'Reports', to: '/reports' },
  { icon: 'category', label: 'Categories', to: '/expense-category', active: true },
  { icon: 'person', label: 'Profile', to: '/profile' },
]

function AddCategoryPage() {
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('movie')
  const [selectedColor, setSelectedColor] = useState('violet')

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopAppBar showProfile />
      
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/expense-category" className="text-secondary material-symbols-outlined hover:text-cyan-400 transition-colors">
              arrow_back
            </Link>
            <span className="text-secondary text-sm uppercase tracking-widest">Budgeting</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Add Category</h1>
          <p className="text-slate-400 mt-2">
            Refine your spending boundaries with electric precision.
          </p>
        </header>

        {/* Form Section */}
        <div className="glass-panel rounded-xl p-6 space-y-6">
          {/* Category Identity */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Name */}
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
              {/* Monthly Budget */}
              <div className="space-y-2">
                <label className="text-sm text-violet-400">Monthly Budget</label>
                <div className="recessed-input rounded-lg border border-outline-variant focus-within:border-secondary transition-colors px-4 py-3 flex items-center">
                  <span className="text-slate-500 mr-2">$</span>
                  <input
                    className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-600 text-base"
                    placeholder="0.00"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Icon Grid Selector */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-violet-400">Visual Identity (Icon)</label>
              <span className="text-xs text-slate-500 capitalize">Selected: {selectedIcon}</span>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {availableIcons.map((icon) => (
                <button
                  key={icon}
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                    selectedIcon === icon
                      ? 'bg-violet-500/20 border border-violet-500/50 text-violet-400 electric-glow'
                      : 'glass-panel hover:bg-white/10 text-slate-400 border border-transparent'
                  }`}
                  onClick={() => setSelectedIcon(icon)}
                >
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Color Palette Selector */}
          <section className="space-y-4">
            <label className="text-sm text-violet-400">Accent Hue</label>
            <div className="flex gap-4">
              {accentColors.map((color) => (
                <button
                  key={color.name}
                  className={`w-8 h-8 rounded-full ${color.class} ${
                    selectedColor === color.name
                      ? `ring-2 ${color.ring} ring-offset-4 ring-offset-background`
                      : 'cursor-pointer'
                  }`}
                  onClick={() => setSelectedColor(color.name)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button className="w-full sm:w-auto px-10 py-3 bg-primary rounded-xl text-on-primary text-sm font-semibold electric-glow active:scale-95 transition-transform">
            Save Changes
          </button>
          <Link
            to="/expense-category"
            className="w-full sm:w-auto px-10 py-3 border border-secondary text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/5 transition-all active:scale-95 text-center"
          >
            Cancel
          </Link>
        </div>

        {/* Visual Decorative Backdrop */}
        <div className="fixed -bottom-32 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] -z-10" />
        <div className="fixed -top-32 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10" />
      </main>

      <BottomNavBar items={navItems} />
    </div>
  )
}