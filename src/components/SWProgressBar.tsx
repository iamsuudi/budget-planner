import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useSWProgress } from '#/hooks/useSWProgress'

interface SWProgressBarProps {
  visible?: boolean
}

export function SWProgressBar({ visible }: SWProgressBarProps) {
  const { progress, status } = useSWProgress()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (status === 'installing') {
      setShow(true)
    } else if (status === 'ready' || status === 'error') {
      const timer = setTimeout(() => setShow(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [status])

  const isVisible = visible ?? show
  const isInstalling = status === 'installing'

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-4 right-4 z-50">
      <div className="mx-auto max-w-120 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <Loader2
            className={`w-5 h-5 text-primary animate-spin ${!isInstalling ? 'hidden' : ''}`}
          />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-on-surface">
                {isInstalling
                  ? 'Preparing offline mode...'
                  : status === 'ready'
                    ? 'Ready for offline use!'
                    : 'Failed to enable offline'}
              </span>
              <span className="text-xs text-slate-400">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
