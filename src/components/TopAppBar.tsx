import {
  ArrowLeft,
  Wallet,
  Wifi,
  WifiOff,
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import { getUser } from '#/lib/storage'
import type { User as UserType } from '#/types'
import { useLocation, useRouter } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useOnlineStatus } from '#/hooks/useOneline'
import { useSecurity } from '#/lib/security'

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
  backTo = '/',
}: TopAppBarProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const router = useRouter()
  const isOnline = useOnlineStatus()
  const { lock } = useSecurity()

  let path = pathname.split('/').find((p) => p != '')
  path = path ? path[0].toUpperCase() + path.slice(1) : 'Home'

  useEffect(() => {
    Promise.resolve(getUser()).then((userData) => {
      setUser(userData || null)
    })
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 w-full z-50">
      <div className="max-w-lg w-full bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-2">
          {showBack ? (
            <ArrowLeft
              className={`text-secondary hover:text-primary active:scale-95 hover:scale-105 size-6 cursor-pointer`}
              onClick={() => router.navigate({ to: backTo })}
            />
          ) : (
            <div className="flex items-center gap-2">
              {/* <img src="/pwa-64x64.png" className="size-10 rounded-full" />*/}
              <p className={`text-2xl font-bold text-primary tracking-tighter`}>
                {path}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {showProfile ? (
            <div className="flex items-center gap-3" ref={dropdownRef}>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border ${
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
              <div className="relative">
                <div
                  className="w-9 h-9 rounded-full overflow-hidden bg-primary border border-violet-500/30 cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img
                    className="w-full h-full object-cover bg-primary"
                    src={user?.profilePicture}
                  />
                </div>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-lg p-1 z-50">
                    <button
                      onClick={() => {
                        router.navigate({ to: '/profile' })
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm text-primary hover:bg-primary/10 rounded-md cursor-pointer"
                    >
                      <User className="w-4 h-4 text-primary" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        router.navigate({ to: '/settings/wallets' })
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm text-error hover:bg-error/10 rounded-md cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-error" />
                      Wallets
                    </button>
                    <button
                      onClick={() => {
                        router.navigate({ to: '/settings' })
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm text-tertiary hover:bg-tertiary/10 rounded-md cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-tertiary" />
                      Settings
                    </button>
                    <div className="border-t border-white/10 my-1" />
                    <button
                      onClick={() => {
                        lock()
                        setShowDropdown(false)
                      }}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-sm text-red-400 hover:bg-white/10 rounded-md cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
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
