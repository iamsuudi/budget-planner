import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`glass-card rounded-xl p-4 ${className}`}>
      {children}
    </div>
  )
}
