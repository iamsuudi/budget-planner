interface IconButtonProps {
  icon: string
  onClick?: () => void
  className?: string
  variant?: 'default' | 'ghost'
}

export function IconButton({ icon, onClick, className = '', variant = 'default' }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center rounded-xl transition-all active:scale-95
        ${variant === 'default' 
          ? 'bg-surface-container border border-white/5 text-secondary hover:text-secondary-fixed' 
          : 'text-slate-500 hover:text-cyan-400'
        }
        ${className}
      `}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  )
}