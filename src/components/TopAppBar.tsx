import { getUser } from '#/lib/storage'
import type { User } from '#/types'
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
  showProfile = true,
  showBack = false,
  backTo,
}: TopAppBarProps) {
  const [user, setUser] = useState<User | null>(null)
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
        {showBack ? (
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-violet-500"
              onClick={() => router.navigate({ to: backTo })}
            >
              back
            </span>
            <span className="text-lg font-black text-violet-500 italic tracking-tighter">
              {title ?? path}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-500">
              account_balance_wallet
            </span>
            <span className="text-lg font-black text-violet-500 italic tracking-tighter">
              {title ?? path}
            </span>
          </div>
        )}
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-cyan-400 transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          {showProfile && (
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary border border-violet-500/30">
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
