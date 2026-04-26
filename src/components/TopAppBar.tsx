import { ArrowLeft } from 'lucide-react'
import { getUser } from '#/lib/storage'
import type { User as UserType } from '#/types'
import { useLocation, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

interface TopAppBarProps {
  title?: string
  showProfile?: boolean
  showBack?: boolean
  backTo?: string
}

export function TopAppBar({
  title,
  showProfile = false,
  showBack = false,
  backTo = '/',
}: TopAppBarProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const { pathname } = useLocation()
  const router = useRouter()

  let path = pathname.split('/').find((p) => p != '')
  path = path ? path[0].toUpperCase() + path.slice(1) : 'Home'

  useEffect(() => {
    Promise.resolve(getUser()).then((userData) => {
      setUser(userData || null)
    })
  }, [])

  return (
    <header className="fixed top-0 w-full z-50">
      <div className="max-w-lg w-full bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-2">
          {showBack && (
            <ArrowLeft
              className="w-5 h-5 text-secondary cursor-pointer"
              onClick={() => router.navigate({ to: backTo })}
            />
          )}
          <span className="text-lg font-black text-secondary tracking-tighter">
            {title ?? path}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* <button className="text-slate-500 hover:text-cyan-400 transition-colors active:scale-95 duration-200">
            <Bell className="w-5 h-5" />
          </button> */}
          {showProfile && (
            <div
              className="w-9 h-9 rounded-full overflow-hidden bg-primary border border-violet-500/30 cursor-pointer"
              onClick={() => router.navigate({ to: '/profile' })}
            >
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src={user?.profilePicture}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
