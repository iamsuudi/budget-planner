import { useEffect } from 'react'
import { useToast } from '#/lib/toast'

export function useSWToasts() {
  const { showToast } = useToast()

  useEffect(() => {
    const handleReady = () => {
      showToast('App ready for offline use!', 'success')
    }

    const handleError = () => {
      showToast('Failed to enable offline mode', 'error')
    }

    const handleProgress = (event: Event) => {
      const customEvent = event as CustomEvent<{ percent: number }>
      if (customEvent.detail.percent === 100) {
        showToast('App ready for offline use!', 'success')
      }
    }

    window.addEventListener('sw-ready', handleReady)
    window.addEventListener('sw-error', handleError)
    window.addEventListener('sw-progress', handleProgress)

    return () => {
      window.removeEventListener('sw-ready', handleReady)
      window.removeEventListener('sw-error', handleError)
      window.removeEventListener('sw-progress', handleProgress)
    }
  }, [showToast])
}
