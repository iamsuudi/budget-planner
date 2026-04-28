import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
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
      const timer = setTimeout(() => setShow(false), 10000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const isVisible = visible ?? show

  if (!isVisible) return null

  return (
    <div className="fixed top-20 left-4 right-4 z-100">
      <div className="mx-auto max-w-120 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          {status === 'installing' && (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}
          {status === 'ready' && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          {status === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-on-surface">
                {status === 'installing'
                  ? 'Downloading...'
                  : status === 'ready'
                    ? 'Ready for offline use!'
                    : 'Failed to register service worker'}
              </span>
              {status === 'installing' && (
                <span className="text-xs text-slate-400">{progress}%</span>
              )}
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  status === 'ready'
                    ? 'bg-green-400 w-full'
                    : status === 'error'
                      ? 'bg-red-400 w-full'
                      : 'bg-linear-to-r from-primary to-secondary'
                }`}
                style={{
                  width: status === 'installing' ? `${progress}%` : '100%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
