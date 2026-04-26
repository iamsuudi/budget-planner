import type { ReactNode } from 'react'

interface PageProps {
  children: ReactNode
  className?: string
}

export function Page({ children, className = '' }: PageProps) {
  return <main className={`py-24 px-4 ${className}`}>{children}</main>
}
