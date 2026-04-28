import type { ReactNode } from 'react'

interface PageProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

export function Page({
  children,
  className = '',
  title,
  description,
}: PageProps) {
  return (
    <main className={`relative py-24 px-4 space-y-6 ${className}`}>
      <div>
        {title && <h2 className="text-3xl font-bold">{title}</h2>}
        {description && (
          <p className="text-sm text-on-surface-variant mt-1">{description}</p>
        )}
      </div>
      {children}
    </main>
  )
}
