var shareData = null
self.addEventListener('connect', (e) => {
  const port = e.ports[0]
  port.addEventListener('message', (event) => {
    if (event.data.get === true) {
      port.postMessage(shareData)
    } else {
      shareData = event.data
    }
  })
  port.start()
})