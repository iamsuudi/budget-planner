import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { TopAppBar, GlassCard, IconButton, ActionListItem } from '../../components/ui'
import { getUser, saveUser } from '../../lib/storage'
import type { User } from '../../types/user'

export const Route = createFileRoute('/profile/edit')({
  component: ProfileEditPage,
})

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23d0bcff' width='100' height='100'/%3E%3Ctext x='50' y='55' dominant-baseline='middle' text-anchor='middle' fill='%230b1326' font-size='40' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E"

function ProfileEditPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getUser().then(user => {
      if (user) {
        setName(user.name)
        setEmail(user.email)
        setProfilePicture(user.profilePicture)
      }
    })
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 200
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setProfilePicture(dataUrl)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setProfilePicture(undefined)
  }

  const handleSave = async () => {
    setSaving(true)
    await saveUser({
      name: name.trim() || 'Unnamed',
      email: email.trim(),
      profilePicture,
    })
    setSaving(false)
    navigate({ to: '/profile' })
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar 
        title="Edit Profile"
        showBack
        onBack={() => navigate({ to: '/profile' })}
        profilePicture={profilePicture || defaultAvatar}
      />
      
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen">
        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-violet-500 to-secondary glow-violet">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-surface">
                  <img
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                    src={profilePicture || defaultAvatar}
                  />
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-primary-container text-on-primary-container p-2 rounded-full shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {profilePicture && (
              <button 
                onClick={handleRemoveImage}
                className="text-sm text-error hover:underline"
              >
                Remove Photo
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40 active:scale-[0.98]"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </section>
      </main>
    </div>
  )
}