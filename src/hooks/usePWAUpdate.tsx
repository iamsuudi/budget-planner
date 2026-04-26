import { useState, useEffect } from 'react'

export const usePWAUpdate = () => {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [showUpdate, setShowUpdate] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // 1. Check if there's already a worker waiting
      if (reg.waiting) {
        setWaitingWorker(reg.waiting)
        setShowUpdate(true)
      }

      // 2. Listen for new workers being installed
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(newWorker)
            setShowUpdate(true)
          }
        })
      })
    })

    // 3. Reload when the new worker actually takes over
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload()
        refreshing = true
      }
    })
  }, [])

  const applyUpdate = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
  }

  return { showUpdate, applyUpdate }
}
