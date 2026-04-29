import { useState, useEffect, useCallback } from 'react'

export type UpdateStatus = 'idle' | 'available' | 'downloading' | 'waiting'

export interface UpdateState {
  currentVersion: string | null
  availableVersion: string | null
  updateStatus: UpdateStatus
  progress: number
  forceUpdate: boolean
}

const STORAGE_KEY = 'swRegisteredVersion'

export const usePWAUpdate = () => {
  const [state, setState] = useState<UpdateState>({
    currentVersion: window.currentSWVersion || localStorage.getItem(STORAGE_KEY),
    availableVersion: window.swAvailableVersion ?? null,
    updateStatus: window.swAvailableVersion ? 'available' : 'idle',
    progress: 0,
    forceUpdate: window.swForceUpdate || false,
  })

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) setRegistration(reg)
    })

    const handleUpdateAvailable = (event: Event) => {
      const detail = (event as CustomEvent<{ version: string }>).detail
      const registeredVersion = localStorage.getItem(STORAGE_KEY)
      setState((prev) => ({
        ...prev,
        currentVersion: window.currentSWVersion || registeredVersion,
        availableVersion: detail?.version ?? null,
        updateStatus: 'available',
      }))
    }

    const handleProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ percent: number }>).detail
      setState((prev) => {
        if (prev.updateStatus !== 'downloading') return prev
        return {
          ...prev,
          progress: detail?.percent ?? 0,
        }
      })
    }

    const handleReady = () => {
      setState((prev) => {
        if (prev.updateStatus !== 'downloading') return prev
        return {
          ...prev,
          updateStatus: 'waiting',
          progress: 100,
        }
      })
    }

    const handleVersionDetected = () => {
      const registeredVersion = localStorage.getItem(STORAGE_KEY)
      setState((prev) => ({
        ...prev,
        currentVersion: window.currentSWVersion || registeredVersion,
        availableVersion: window.swAvailableVersion ?? null,
        forceUpdate: window.swForceUpdate || false,
      }))
    }

    window.addEventListener('sw-update-available', handleUpdateAvailable)
    window.addEventListener('sw-progress', handleProgress)
    window.addEventListener('sw-ready', handleReady)
    window.addEventListener('sw-version-detected', handleVersionDetected)

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable)
      window.removeEventListener('sw-progress', handleProgress)
      window.removeEventListener('sw-ready', handleReady)
      window.removeEventListener('sw-version-detected', handleVersionDetected)
    }
  }, [])

  const dismissUpdate = useCallback(() => {
    if (state.forceUpdate) return
    sessionStorage.setItem('sw-dismissed-update', 'true')
    setState((prev) => ({
      ...prev,
      updateStatus: 'idle',
    }))
  }, [state.forceUpdate])

  const acceptUpdate = useCallback(async () => {
    setState((prev) => ({ ...prev, updateStatus: 'downloading', progress: 0 }))

    try {
      const res = await fetch('/version.json?t=' + Date.now())
      const manifest = await res.json()
      const version = manifest?.version
      if (!version) return

      const swUrl = '/sw-v' + version + '.js'
      const newReg = await navigator.serviceWorker.register(swUrl)

      setRegistration(newReg)

      localStorage.setItem(STORAGE_KEY, version)
      window.currentSWVersion = version
      window.swAvailableVersion = version

      const installingWorker = newReg.installing
      if (installingWorker) {
        await new Promise<void>((resolve) => {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed') {
              resolve()
            }
          })
        })
      }

      if (newReg.waiting) {
        setState((prev) => ({
          ...prev,
          updateStatus: 'waiting',
          progress: 100,
        }))
      }
    } catch (error) {
      console.error('Failed to register new SW:', error)
      setState((prev) => ({ ...prev, updateStatus: 'available' }))
    }
  }, [])

  const activateUpdate = useCallback(() => {
    const sw = registration?.waiting || registration?.installing
    if (sw) {
      sw.postMessage({ type: 'SKIP_WAITING' })
    }
  }, [registration])

  const checkForUpdates = useCallback(async () => {
    try {
      const res = await fetch('/version.json?t=' + Date.now())
      if (!res.ok) return
      const manifest = await res.json()
      const version = manifest?.version
      if (!version) return

      window.swForceUpdate = manifest.forceUpdate === true

      const registeredVersion = localStorage.getItem(STORAGE_KEY)
      if (registeredVersion && registeredVersion !== version) {
        window.swAvailableVersion = version
        setState((prev) => ({
          ...prev,
          currentVersion: registeredVersion,
          availableVersion: version,
          updateStatus: 'available',
          forceUpdate: manifest.forceUpdate === true,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          currentVersion: window.currentSWVersion || registeredVersion,
        }))
      }
    } catch {
      // offline
    }
  }, [])

  return {
    ...state,
    dismissUpdate,
    acceptUpdate,
    activateUpdate,
    checkForUpdates,
  }
}
