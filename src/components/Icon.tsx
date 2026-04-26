import { getIcon } from '#/lib/icons'

interface IconProps {
  name: string
  className?: string
  size?: number
}

export function Icon({ name, className = '', size = 24 }: IconProps) {
  const LucideIcon = getIcon(name)
  return <LucideIcon className={className} size={size} />
}