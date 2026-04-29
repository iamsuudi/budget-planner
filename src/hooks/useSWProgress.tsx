import { useState, useEffect } from 'react'

type SWStatus = 'idle' | 'installing' | 'ready' | 'error'

interface SWProgress {
  progress: number
  status: SWStatus
}

declare global {
  interface Window {
    swReady?: boolean
    swError?: boolean
    latestSWVersion?: string
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

    // Don't show progress if onboarding isn't complete
    const welcomeSeen = localStorage.getItem('welcome-seen') === 'true'
    let securitySetUp = false
    try {
      const settings = localStorage.getItem('security-settings')
      if (settings) {
        const parsed = JSON.parse(settings)
        securitySetUp = parsed.pinEnabled || parsed.biometricEnabled
      }
    } catch {}

    if (!welcomeSeen || !securitySetUp) {
      // Still in onboarding, don't show progress
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

    setProgress((prev) => ({ ...prev, status: 'installing' }))

    return () => {
      window.removeEventListener('sw-ready', handleReady)
      window.removeEventListener('sw-error', handleError)
      window.removeEventListener('sw-progress', handleProgress)
    }
  }, [])

  return progress
}
