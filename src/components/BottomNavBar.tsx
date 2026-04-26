import { Link, useLocation } from '@tanstack/react-router'
import { Home, BarChart3, User, Settings } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: BarChart3, label: 'Reports', to: '/reports' },
  { icon: User, label: 'Profile', to: '/profile' },
  { icon: Settings, label: 'Settings', to: '/settings' },
]

export function BottomNavBar() {
  const location = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50">
      <div className="max-w-lg flex justify-around items-center pb-safe px-4 h-20 mx-auto bg-slate-950/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
            flex flex-col items-center justify-center transition-all duration-200
            ${
              isActive
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] active:scale-90'
                : 'text-slate-500 hover:text-violet-400 active:scale-90'
            }
          `}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
