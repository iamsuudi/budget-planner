import { useState, useEffect, useCallback, useRef } from 'react'

export type UpdateStatus = 'idle' | 'available' | 'downloading'

export interface UpdateState {
  currentVersion: string | null
  availableVersion: string | null
  updateStatus: UpdateStatus
  progress: number
  forceUpdate: boolean
}

const STORAGE_KEY = 'swRegisteredVersion'

// Shared store to keep all hook instances in sync
type Listener = (state: UpdateState) => void
let globalState: UpdateState = {
  currentVersion: null,
  availableVersion: null,
  updateStatus: 'idle',
  progress: 0,
  forceUpdate: false,
}
const listeners = new Set<Listener>()

const getInitialState = (): UpdateState => ({
  currentVersion: window.currentSWVersion || localStorage.getItem(STORAGE_KEY),
  availableVersion: window.swAvailableVersion ?? null,
  updateStatus: window.swAvailableVersion ? 'available' : 'idle',
  progress: 0,
  forceUpdate: window.swForceUpdate || false,
})

const notify = () => {
  listeners.forEach((fn) => fn(globalState))
}

const setGlobalState = (updater: (prev: UpdateState) => UpdateState) => {
  const prev = globalState
  const next = updater(prev)
  if (next !== prev) {
    globalState = next
    notify()
  }
}

export const usePWAUpdate = () => {
  const [state, setState] = useState<UpdateState>(getInitialState)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Subscribe to global state changes
    listeners.add(setState)
    // Sync initial state if needed
    if (globalState.updateStatus !== 'idle' || globalState.availableVersion) {
      setState(globalState)
    }

    return () => {
      listeners.delete(setState)
    }
  }, [])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) registrationRef.current = reg
    })

    const handleUpdateAvailable = (event: Event) => {
      const detail = (event as CustomEvent<{ version: string }>).detail
      const registeredVersion = localStorage.getItem(STORAGE_KEY)
      setGlobalState((prev) => ({
        ...prev,
        currentVersion: window.currentSWVersion || registeredVersion,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        availableVersion: detail?.version ?? null,
        updateStatus: 'available',
      }))
    }

    const handleProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ percent: number }>).detail
      setGlobalState((prev) => {
        if (prev.updateStatus !== 'downloading') return prev
        return {
          ...prev,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          progress: detail?.percent ?? 0,
        }
      })
    }

    const handleReady = () => {
      setGlobalState((prev) => {
        if (prev.updateStatus !== 'downloading') return prev
        return {
          ...prev,
          updateStatus: 'idle',
          progress: 100,
        }
      })
      const sw =
        registrationRef.current?.waiting || registrationRef.current?.installing
      if (sw) {
        sw.postMessage({ type: 'SKIP_WAITING' })
      }
    }

    const handleVersionDetected = () => {
      const registeredVersion = localStorage.getItem(STORAGE_KEY)
      setGlobalState((prev) => ({
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
    if (globalState.forceUpdate) return
    sessionStorage.setItem('sw-dismissed-update', 'true')
    setGlobalState((prev) => ({
      ...prev,
      updateStatus: 'idle',
    }))
  }, [])

  const acceptUpdate = useCallback(async () => {
    setGlobalState((prev) => ({
      ...prev,
      updateStatus: 'downloading',
      progress: 0,
    }))

    try {
      const res = await fetch('/version.json?t=' + Date.now())
      const manifest = await res.json()
      const version = manifest?.version
      if (!version) return

      const swUrl = '/sw-v' + version + '.js'
      const newReg = await navigator.serviceWorker.register(swUrl)

      registrationRef.current = newReg

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
        newReg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch (error) {
      console.error('Failed to register new SW:', error)
      setGlobalState((prev) => ({ ...prev, updateStatus: 'available' }))
    }
  }, [])

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
        setGlobalState((prev) => ({
          ...prev,
          currentVersion: registeredVersion,
          availableVersion: version,
          updateStatus: 'available',
          forceUpdate: manifest.forceUpdate === true,
        }))
      } else {
        setGlobalState((prev) => ({
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
    checkForUpdates,
  }
}
