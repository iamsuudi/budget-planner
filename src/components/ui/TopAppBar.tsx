interface TopAppBarProps {
  showProfile?: boolean
}

export function TopAppBar({ showProfile = true }: TopAppBarProps) {
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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBL-58AopKdJepj_zcXbl_GOtHLuzeP3ai3Lm-fkHXVayqrEeg9AklVBgVdGzvDqU0HuJCRxhrCdr-oxhklqsA_DQTYrtIES7RMuqwvqBt-biVuJGXQDnaOKdiIzflSWGCyETju91pCJUPPHO27l2qGcVDw373zCLFENwUD2MJZxnUfmIAxiIVh4kZmfLovtDwp-36c6GuPQIo2y1r042V9S8GJkVpCECIBN3LJIr7E6SkCZ_f8V_4M2Q3UwciRkk8esqE-dFJYK59"
            />
          </div>
        )}
      </div>
    </header>
  )
}
