import { useState, useEffect, useCallback } from 'react'

declare global {
  interface Navigator {
    standalone?: boolean
  }
}

export type PWAInstallStatus = 'installable' | 'installed' | 'not-installable'

export const usePWAInstall = () => {
  const [status, setStatus] = useState<PWAInstallStatus>(() => {
    if (window.deferredInstallPrompt) return 'installable'
    if (navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)) {
      return 'installed'
    }
    return 'not-installable'
  })

  useEffect(() => {
    const standaloneHandler = (e: MediaQueryListEvent) => {
      if (e.matches) setStatus('installed')
    }

    const installableHandler = () => setStatus('installable')

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', standaloneHandler)

    window.addEventListener('pwa-prompt-captured', installableHandler)
    window.addEventListener('beforeinstallprompt', installableHandler)

    if (navigator.standalone) {
      setStatus('installed')
    }

    return () => {
      mediaQuery.removeEventListener('change', standaloneHandler)
      window.removeEventListener('pwa-prompt-captured', installableHandler)
      window.removeEventListener('beforeinstallprompt', installableHandler)
    }
  }, [])

  const showInstallPrompt = useCallback(async () => {
    const promptEvent = window.deferredInstallPrompt
    if (!promptEvent) return

    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice

    window.deferredInstallPrompt = null
    setStatus('installed')

    return outcome
  }, [])

  return { installStatus: status, showInstallPrompt }
}