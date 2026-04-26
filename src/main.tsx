import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { ToastProvider } from './lib/toast'

const queryClient = new QueryClient()

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredInstallPrompt = e as any
  window.dispatchEvent(new Event('pwa-prompt-captured'))
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (registration.active) {
          window.swReady = true
          window.dispatchEvent(new CustomEvent('sw-ready'))
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                window.swReady = true
                window.dispatchEvent(new CustomEvent('sw-ready'))
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('SW registration failed:', error)
        window.swError = true
        window.dispatchEvent(new CustomEvent('sw-error'))
      })
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
      </ToastProvider>
    </QueryClientProvider>,
  )
}
