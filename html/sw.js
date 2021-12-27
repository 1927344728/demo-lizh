const CACHE_VERSION = 'v1.0.2'
const cacheAllowlist = [
  '/others_01.html?type=8',
  '/assets/third/utils.js',
  '/assets/js/others_01_03.js',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(cacheAllowlist).then(() => {
        console.log('安装成功：', cacheAllowlist)
      })
    })
  )
})
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('存在缓存：', event.request.url)
        return response
      }
      return fetch(event.request).then((response) => {
        // 注意：必需先复制 response。
        // 因为 response 是数据流，主体只能使用一次。 
        // 由于我们想要 response 能被浏览器使用，并将其传递到缓存以供使用，因此需要复制一份副本：一份发送给浏览器，另一份则保留在缓存。
        const responseToCache = response.clone()
        if(responseToCache && responseToCache.status === 200 && responseToCache.url.match('others_01_02.js')) {
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseToCache)
            console.log('新增缓存：', responseToCache.url)
          })
        }
        return response
      })
    })
  )
})
self.addEventListener('activate', (event) => {
  console.log('update06')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const cacheAllowVersions = [CACHE_VERSION]
      return Promise.all(
        cacheNames.map((name) => {
          if (cacheAllowVersions.indexOf(name) === -1) {
            return caches.delete(name)
          }
        })
      )
    })
  )
})
self.addEventListener('message', (event) => {
  console.log(`[Client]接收：${event.data}`)
  event.waitUntil(
      self.clients.matchAll().then((clients) => {
          if (!clients || !clients.length) {
              return
          }
          clients.forEach((client) => {
              client.postMessage(event.data)
          })
      })
  )
})
