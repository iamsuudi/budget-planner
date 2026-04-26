import { useState, useEffect } from 'react'

interface SWProgress {
  progress: number
  status: 'idle' | 'installing' | 'ready' | 'error'
}

declare global {
  interface Window {
    swReady?: boolean
    swError?: boolean
  }
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

    const handleReady = () => {
      setProgress({ progress: 100, status: 'ready' })
    }

    const handleError = () => {
      setProgress({ progress: 0, status: 'error' })
    }

    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ percent: number }>
      setProgress({ progress: customEvent.detail.percent, status: 'installing' })
    }

    window.addEventListener('sw-ready', handleReady)
    window.addEventListener('sw-error', handleError)
    window.addEventListener('sw-progress', handleProgress)

    if (window.swReady || navigator.serviceWorker.controller) {
      setProgress({ progress: 100, status: 'ready' })
    } else {
      setProgress((prev) => ({ ...prev, status: 'installing' }))
    }

    return () => {
      window.removeEventListener('sw-ready', handleReady)
      window.removeEventListener('sw-error', handleError)
      window.removeEventListener('sw-progress', handleProgress)
    }
  }, [])

  return progress
}