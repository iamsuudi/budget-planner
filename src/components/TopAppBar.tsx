import { ArrowLeft, Wifi, WifiOff } from 'lucide-react'
import { getUser } from '#/lib/storage'
import type { User as UserType } from '#/types'
import { useLocation, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useOnlineStatus } from '#/hooks/useOneline'

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
  const isOnline = useOnlineStatus()

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
          <p className="text-xl font-bold text-primary tracking-tighter">
            {title ?? path}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {showProfile ? (
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  isOnline
                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                    : 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                }`}
                title={isOnline ? 'Online' : 'Offline'}
              >
                {isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </div>
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
            </div>
          ) : (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                isOnline
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : 'bg-orange-500/20 border-orange-500/40 text-orange-400'
              }`}
              title={isOnline ? 'Online' : 'Offline'}
            >
              {isOnline ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
