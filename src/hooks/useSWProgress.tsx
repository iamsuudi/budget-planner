import { useState, useEffect } from 'react'

type SWStatus = 'idle' | 'installing' | 'ready' | 'error'

interface SWProgress {
  progress: number
  status: SWStatus
}

export function useSWProgress(): SWProgress {
  const [progress, setProgress] = useState<SWProgress>({
    progress: 0,
    status: 'idle',
  })

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setProgress({ progress: 0, status: 'error' })
      return
    }

    if (window.swError) {
      setProgress({ progress: 0, status: 'error' })
      return
    }

    if (window.swReady || navigator.serviceWorker.controller) {
      setProgress({ progress: 100, status: 'ready' })
      return
    }

    const handleReady = () => {
      setProgress({ progress: 100, status: 'ready' })
    }

    const handleError = () => {
      setProgress({ progress: 0, status: 'error' })
    }

    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ percent: number }>
      setProgress({
        progress: customEvent.detail.percent,
        status: 'installing',
      })
    }

    window.addEventListener('sw-ready', handleReady)
    window.addEventListener('sw-error', handleError)
    window.addEventListener('sw-progress', handleProgress)

    // Don't set 'installing' here - wait for actual progress events
    // The SW registration is delayed until onboarding completes

    return () => {
      window.removeEventListener('sw-ready', handleReady)
      window.removeEventListener('sw-error', handleError)
      window.removeEventListener('sw-progress', handleProgress)
    }
  }, [])

  return progress
}
