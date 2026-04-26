interface TopAppBarProps {
  showProfile?: boolean
  profilePicture?: string
}

export function TopAppBar({ showProfile = true, profilePicture }: TopAppBarProps) {
  const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23d0bcff' width='100' height='100'/%3E%3Ctext x='50' y='55' dominant-baseline='middle' text-anchor='middle' fill='%230b1326' font-size='40' font-family='sans-serif'%3E%3F%3C/text%3E%3C/svg%3E"
  
  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 h-16">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-violet-500">
          account_balance_wallet
        </span>
        <span className="text-lg font-black text-violet-500 italic tracking-tighter">
          Vivid Ledger
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-500 hover:text-cyan-400 transition-colors active:scale-95 duration-200">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        {showProfile && (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-violet-500/30">
            <img
              alt="User Profile"
              className="w-full h-full object-cover"
              src={profilePicture || defaultAvatar}
            />
          </div>
        )}
      </div>
    </header>
  )
}
