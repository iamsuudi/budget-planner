import { Link } from '@tanstack/react-router'

interface NavItem {
  icon: string
  label: string
  to: string
  active?: boolean
}

interface BottomNavBarProps {
  items: NavItem[]
}

export function BottomNavBar({ items }: BottomNavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-xl flex justify-around items-center pb-safe px-4 h-20 z-50 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`
            flex flex-col items-center justify-center transition-all duration-200
            ${
              item.active
                ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] active:scale-90'
                : 'text-slate-500 hover:text-violet-400 active:scale-90'
            }
          `}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}
