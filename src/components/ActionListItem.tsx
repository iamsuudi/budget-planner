import { ChevronRight } from 'lucide-react'
import { Icon } from '#/components/Icon'

interface ActionListItemProps {
  icon: string
  iconBg: string
  iconColor?: string
  title: string
  description?: string
  showChevron?: boolean
  onClick?: () => void
  danger?: boolean
}

export function ActionListItem({ 
  icon, 
  iconBg, 
  iconColor = 'text-violet-400',
  title, 
  description, 
  showChevron = true,
  onClick,
  danger = false 
}: ActionListItemProps) {
  return (
    <button
      onClick={onClick}
      className="glass-card flex items-center justify-between p-6 rounded-xl hover:bg-white/5 transition-all group w-full text-left"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBg}`}>
          <Icon name={icon} className={iconColor} size={20} />
        </div>
        <div>
          <p className={`text-sm font-semibold ${danger ? 'text-error' : 'text-on-background'}`}>
            {title}
          </p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {showChevron && (
        <ChevronRight className="text-slate-600 group-hover:text-on-background transition-colors w-5 h-5" />
      )}
    </button>
  )
}