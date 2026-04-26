import { useState, useEffect, useCallback } from 'react'

export const usePWAInstall = () => {
  // 1. Check if the "Catcher" already found it before this Hook loaded
  const [installable, setInstallable] = useState(!!window.deferredInstallPrompt)

  useEffect(() => {
    const handler = () => setInstallable(true)

    // 2. Listen for the "Catcher" to signal it found something
    window.addEventListener('pwa-prompt-captured', handler)

    // 3. Also listen for the raw event (in case it fires late)
    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('pwa-prompt-captured', handler)
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const showInstallPrompt = useCallback(async () => {
    const promptEvent = window.deferredInstallPrompt
    if (!promptEvent) return

    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice

    // Clear it after use as it can only be prompted once
    window.deferredInstallPrompt = null
    setInstallable(false)

    return outcome
  }, [])

  return { installable, showInstallPrompt }
}
