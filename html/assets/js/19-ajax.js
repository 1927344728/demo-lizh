function sendXMLHttpRequest() {
  var xhr = new XMLHttpRequest()
  xhr.withCredentials = true
  xhr.onreadystatechange = function () {
    // 通信成功时，状态值为4
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        console.log(xhr.responseText)
      } else {
        console.error(xhr.statusText)
      }
    }
  }
  xhr.onerror = function (e) {
    console.error(xhr.statusText)
  }
  xhr.open('GET', 'http://localhost:3000', true)
  xhr.send(null)
}

function loadImage() {
  var xhr = new XMLHttpRequest()
  xhr.withCredentials = true
  xhr.open('GET', 'assets/img/20190419141710_4735vxaqwhri_small.jpg', true)
  xhr.responseType = 'blob'
  xhr.onload = function (e) {
    var img = document.createElement('img')
    img.style.width = '100%'
    img.src = window.URL.createObjectURL(this.response)
    document.body.appendChild(img)
  }
  xhr.send()
}