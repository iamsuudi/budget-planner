import { useState, useEffect } from 'react'

export const usePWAVersion = () => {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [latestVersion, setLatestVersion] = useState<string | null>(null)

  useEffect(() => {
    const handleVersion = () => {
      const registered = localStorage.getItem('swRegisteredVersion')
      if (window.currentSWVersion) {
        setCurrentVersion(window.currentSWVersion)
      } else if (registered) {
        setCurrentVersion(registered)
      }
      if (window.latestSWVersion) {
        setLatestVersion(window.latestSWVersion)
      }
    }

    handleVersion()

    window.addEventListener('sw-version-detected', handleVersion)
    window.addEventListener('sw-ready', handleVersion)
  }, [])

  return { currentVersion, latestVersion }
}
