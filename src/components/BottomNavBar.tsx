import { Link, useLocation } from '@tanstack/react-router'
import { Receipt, Wallet, BarChart3, FileText, AlarmCheck } from 'lucide-react'

const navItems = [
  { icon: Receipt, label: 'Expense', to: '/expense' },
  { icon: BarChart3, label: 'Budget', to: '/budget' },
  { icon: Wallet, label: 'Salary', to: '/salary' },
  { icon: AlarmCheck, label: 'Todo', to: '/todo' },
  { icon: FileText, label: 'Notes', to: '/note' },
]

export function BottomNavBar() {
  const location = useLocation()
  const welcomeSeen = localStorage.getItem('welcome-seen') === 'true'
  const securitySetUp = localStorage.getItem('security-settings')
    ? JSON.parse(localStorage.getItem('security-settings')!).pinEnabled ||
      JSON.parse(localStorage.getItem('security-settings')!).biometricEnabled
    : false
  const isOnboardingComplete = welcomeSeen && securitySetUp

  if (!isOnboardingComplete) return null

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50">
      <div className="max-w-lg flex justify-around items-center pb-safe px-4 h-15 mx-auto bg-slate-950/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
            flex flex-col items-center justify-center transition-all duration-200 px-2
            ${
              isActive
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] active:scale-90'
                : 'text-slate-500 hover:text-violet-400 active:scale-90'
            }
          `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-widest">
                {item.label[0].toUpperCase() + item.label.slice(1)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
