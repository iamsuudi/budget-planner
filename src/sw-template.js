// This placeholder is replaced by the Node script

let CACHE_NAME = 'sw-v0.0.1'
let ASSETS_TO_CACHE = []
// [[CACHE_NAME]]
// [[ASSETS_LIST]]

// INSTALL: Download everything immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      let downloaded = 0

      // inside sw.js install event
      for (const url of ASSETS_TO_CACHE) {
        try {
          await cache.add(url)

          downloaded++
          const percent = Math.round(
            (downloaded / ASSETS_TO_CACHE.length) * 100,
          )

          // 2. Use the original logic to tell the browser about progress
          const clients = await self.clients.matchAll({
            includeUncontrolled: true,
          })
          clients.forEach((client) => {
            client.postMessage({
              type: 'PROGRESS',
              percent: percent,
            })
          })

          console.log(`✅ Cached and reported: ${url}`)
        } catch (err) {
          console.error(`❌ Failed to cache ${url}:`, err)
        }
      }
    })(),
  )
})

// FETCH: Serve from cache first, fallback to network
self.addEventListener('fetch', async (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  event.respondWith(
    caches
      .open(CACHE_NAME)
      .then((chache) => chache.match(url.pathname))
      .then((cachedResponse) => {
        console.log({ cachedResponse })
        // 1. If found in cache, return it immediately
        if (cachedResponse) {
          return cachedResponse
        }

        // 2. SPA Fallback: If it's a page navigation, give them index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }

        // 3. Last resort: Try network
        return fetch(event.request).catch((err) => {
          console.error('Offline and file not in cache:', event.request.url)
          // This stops the "Uncaught in promise" error
          return new Response('Offline content not available', { status: 503 })
        })
      }),
  )
})

// IMPORTANT: Delete old caches when the new version activates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
    }),
  )
})

// Listen for a message from the React UI to skip waiting
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
