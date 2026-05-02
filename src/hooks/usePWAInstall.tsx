import { useState, useEffect, useCallback } from 'react'

export type PWAInstallStatus = 'installable' | 'installed' | 'not-installable'

const getInstalledDisplayMode = () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!window.matchMedia) return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches
  )
}

export const usePWAInstall = () => {
  const [status, setStatus] = useState<PWAInstallStatus>(() => {
    if (window.deferredInstallPrompt) {
      localStorage.removeItem('pwa-installed')
      return 'installable'
    }
    if (navigator.standalone || getInstalledDisplayMode()) {
      localStorage.setItem('pwa-installed', 'true')
      return 'installed'
    }
    if (localStorage.getItem('pwa-installed') === 'true') {
      return 'installed'
    }
    return 'not-installable'
  })

  useEffect(() => {
    const displayModeHandler = () => {
      if (getInstalledDisplayMode()) {
        localStorage.setItem('pwa-installed', 'true')
        setStatus('installed')
      }
    }

    const installableHandler = () => {
      localStorage.removeItem('pwa-installed')
      setStatus('installable')
    }

    const mediaQueries = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: fullscreen)'),
      window.matchMedia('(display-mode: minimal-ui)'),
    ]

    mediaQueries.forEach((mq) =>
      mq.addEventListener('change', displayModeHandler),
    )

    window.addEventListener('pwa-prompt-captured', installableHandler)
    window.addEventListener('beforeinstallprompt', installableHandler)

    if (navigator.standalone || getInstalledDisplayMode()) {
      localStorage.setItem('pwa-installed', 'true')
      setStatus('installed')
    }

    return () => {
      mediaQueries.forEach((mq) =>
        mq.removeEventListener('change', displayModeHandler),
      )
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
    localStorage.setItem('pwa-installed', 'true')
    setStatus('installed')

    return outcome
  }, [])

  return { installStatus: status, showInstallPrompt }
}
