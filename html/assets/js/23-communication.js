var basicDomain = 'http://localhost:5200'

function initPage (type) {
  switch (type) {
    case 1: {
      var BC = new BroadcastChannel('zhao')
      window.BC = BC
      BC.onmessage = function (e) {
        console.log(`[频道@${e.target.name}]接收：${e.data}`)
        document.querySelector('.box_01').querySelector('.content').innerHTML = e.data
      }
      break
    }
    case 2: {
      navigator.serviceWorker.register('sw.js').then(() => {
        console.log('ServiceWorker 注册成功')
      })
      navigator.serviceWorker.addEventListener('message', (e) => {
        console.log(`[ServiceWorker]接收：${e.data}`)
        document.querySelector('.box_02').querySelector('.content').innerHTML = e.data
      })
      break
    }
    case 3: {
      window.addEventListener('storage', (e) => {
        console.log(`[LocalStorage]接收：key-${e.key}，新数据-${e.newValue}，老数据-${e.oldValue}`)
        document.querySelector('.box_03').querySelector('.content').innerHTML = e.newValue
      })
      break
    }
    case 4: {
      var sharedWorker = new SharedWorker('shared.worker.js', 'zhao')
      window.sharedWorker = sharedWorker
      sharedWorker.port.onmessage = (e) => {
        console.log('[Shared Worker]接收：', e.data)
        document.querySelector('.box_04').querySelector('.content').innerHTML = e.data.msg
      }
      break
    }
    default: {

    }
  }
}

function getCrossOriginData2(targetUrl, proxyUrl, callback) {
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = targetUrl

  let isFirstLoad = true
  iframe.onload = function () {
    if (isFirstLoad) {
      isFirstLoad = false
      iframe.contentWindow.location = proxyUrl
    } else {
      callback(iframe)
      iframe.contentWindow.document.write('')
      iframe.contentWindow.close()
      document.body.removeChild(iframe)
    }
  }
  document.body.appendChild(iframe)
}

function sendLocationHashToFrame () {
  const frame = document.querySelector('#locationHashIframe')
  frame.src = frame.src + `#Hello, This is Page A!`
}

function sendLocationHashToParent (e) {
  window.parent.location.href = `${basicDomain}/23-commumication(A).html?type=8#Hello, This is Page B!`
}