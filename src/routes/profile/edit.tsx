import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Camera } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useGetUser, useUpdateUser } from '#/hooks/query'
import { Page } from '#/components/Page'
import { TopAppBar } from '#/components/TopAppBar'

export const Route = createFileRoute('/profile/edit')({
  component: ProfileEditPage,
})

const defaultAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23d0bcff' width='100' height='100'/%3E%3Ctext x='50' y='55' dominant-baseline='middle' text-anchor='middle' fill='%230b1326' font-size='40' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E"

function ProfileEditPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: user } = useGetUser()
  const updateUser = useUpdateUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [profilePicture, setProfilePicture] = useState<string | undefined>()

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setProfilePicture(user.profilePicture)
    }
  }, [user])

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

  const handleSave = () => {
    updateUser.mutate(
      {
        name: name.trim() || 'Unnamed',
        email: email.trim(),
        profilePicture,
      },
      { onSuccess: () => navigate({ to: '/profile' }) },
    )
  }

  return (
    <div className="min-h-screen bg-surface-dim text-on-background antialiased">
      <TopAppBar title="Profile" showBack backTo={'/profile'} />

      <Page className="">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <div className="relative group mb-3">
              <div className="w-20 h-20 rounded-full p-0.5 bg-linear-to-tr from-violet-500 to-secondary glow-violet">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-surface">
                  <img
                    className="w-full h-full object-cover"
                    src={profilePicture || defaultAvatar}
                  />
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container p-1.5 rounded-full shadow-lg border border-white/20 transition-all hover:scale-110 active:scale-95"
              >
                <Camera className="w-4 h-4" />
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
                className="text-xs text-error hover:underline"
              >
                Remove Photo
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-surface-container-high rounded-lg px-3 py-2 text-on-surface placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={updateUser.isPending}
            className="w-full bg-linear-to-r from-violet-600 to-violet-500 text-white font-semibold py-3 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {updateUser.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </section>
      </Page>
    </div>
  )
}
