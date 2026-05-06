import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { ToastProvider } from './lib/toast'
import { UpdatePrompt } from './components/UpdatePrompt'
import { isVersionLessThan } from './lib/version'

const queryClient = new QueryClient()
const STORAGE_KEY = 'swRegisteredVersion'

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredInstallPrompt = e as any
  window.dispatchEvent(new Event('pwa-prompt-captured'))
})

async function checkForUpdate() {
  try {
    const res = await fetch('/version.json?t=' + Date.now())
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function shouldRegisterSW(): boolean {
  // Don't register SW until onboarding is complete
  const welcomeSeen = localStorage.getItem('welcome-seen') === 'true'

  // Check if security is set up (PIN or biometric enabled)
  try {
    const securitySettings = localStorage.getItem('security-settings')
    if (securitySettings) {
      const settings = JSON.parse(securitySettings)
      if (settings.pinEnabled || settings.biometricEnabled) {
        return welcomeSeen
      }
    }
  } catch {}

  return false
}

async function registerServiceWorker() {
  const manifest = await checkForUpdate()
  if (!manifest?.version) return

  window.latestSWVersion = manifest.version
  const registeredVersion = localStorage.getItem(STORAGE_KEY) || '0.0.0'
  const minSupportedVersion = manifest.minSupportedVersion || '0.0.0'

  window.swMinSupportedVersion = minSupportedVersion
  window.swUpdateRequired = isVersionLessThan(registeredVersion, minSupportedVersion)

  if (!registeredVersion || registeredVersion === '0.0.0') {
    const swUrl = '/sw-v' + manifest.version + '.js'
    const registration = await navigator.serviceWorker.register(swUrl)

    localStorage.setItem(STORAGE_KEY, manifest.version)
    window.currentSWVersion = manifest.version
    window.dispatchEvent(new CustomEvent('sw-version-detected'))

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            window.swReady = true
            window.dispatchEvent(new CustomEvent('sw-ready'))
          }
        })
      }
    })
  } else if (registeredVersion === manifest.version) {
    window.currentSWVersion = manifest.version

    const registration = await navigator.serviceWorker.getRegistration()
    if (registration?.active) {
      window.swReady = true
      window.dispatchEvent(new CustomEvent('sw-ready'))
    }

    window.dispatchEvent(new CustomEvent('sw-version-detected'))
  } else {
    window.swAvailableVersion = manifest.version
    window.currentSWVersion = registeredVersion

    const dismissed = sessionStorage.getItem('sw-dismissed-update')
    if (!dismissed || window.swUpdateRequired) {
      window.dispatchEvent(
        new CustomEvent('sw-update-available', {
          detail: { version: manifest.version },
        }),
      )
    } else {
      window.dispatchEvent(new CustomEvent('sw-version-detected'))
    }
  }

  navigator.serviceWorker.ready.catch((error) => {
    console.error('SW registration failed:', error)
    window.swError = true
    window.dispatchEvent(new CustomEvent('sw-error'))
  })
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    // Wait for onboarding to complete before registering SW
    if (!shouldRegisterSW()) {
      // Check again after a delay (onboarding might be in progress)
      let attempts = 0
      const checkInterval = setInterval(async () => {
        attempts++
        if (shouldRegisterSW() || attempts > 60) {
          clearInterval(checkInterval)
          if (shouldRegisterSW()) {
            await registerServiceWorker()
          }
        }
      }, 1000)
      return
    }

    await registerServiceWorker()
  })
}

navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data?.type === 'PROGRESS') {
    const percent = parseInt(event.data.percent, 10)
    window.dispatchEvent(
      new CustomEvent('sw-progress', { detail: { percent } }),
    )
    if (percent === 100) {
      window.swReady = true
      window.dispatchEvent(new CustomEvent('sw-ready'))
    }
  }
})

navigator.serviceWorker.addEventListener('controllerchange', () => {
  window.location.reload()
})

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        <UpdatePrompt />
      </ToastProvider>
    </QueryClientProvider>,
  )
}
