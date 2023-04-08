function ckPostMessage() {
  document.querySelector('.children_tx').innerHTML = ''
  let colorValue = [
    Math.round(Math.random() * 255).toString(16),
    Math.round(Math.random() * 255).toString(16),
    Math.round(Math.random() * 255).toString(16),
  ].join('')
  console.log(colorValue)
  window.frames[0].postMessage(`#${colorValue}`,'http://192.168.2.103:3000/12-input.html')
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = function () {
      resolve(image)
    }
    image.onerror = function () {
      reject(new Error(`加载出错： ${url}`))
    }
    image.src = url
  })
}

function getText(url) {
  return new Promise((resolve, reject) => {
    const http = new XMLHttpRequest()
    http.open("GET", url)
    http.onreadystatechange = function () {
      if (this.readyState !== 4) {
        return
      }
      if (this.status === 200) {
        return resolve(this.response)
      } else {
        return reject(new Error(this.statusText))
      }
    }
    http.send()
  })
}

function sequencePromisesWithForThen (promises) {
  function recordValue(results, value) {
      results.push(value)
      return results
  }
  // 记录每个Promise实例的执行结果。如果不调用此方法，函数最后的Promise的传递出来的参数，只有最后一个Promise实例的执行结果
  const pushValue = recordValue.bind(null, [])
  let promise = Promise.resolve()
  for (let i = 0; i < promises.length; i++) {
      promise = promise.then(promises[i]).then(pushValue)
  }
  return promise
}

function sequencePromisesWithReduce (promises) {
  function recordValue(results, value) {
      results.push(value)
      return results
  }
  // 记录每个Promise实例的执行结果。如果不调用此方法，函数最后的Promise的传递出来的参数，只有最后一个Promise实例的执行结果
  const pushValue = recordValue.bind(null, [])
  return promises.reduce((promise, task) => {
    return promise.then(task).then(pushValue)
  }, Promise.resolve())
}

async function sequencePromisesForAsync(promises) {
  const result = []
  for (let f of promises) {
      result.push(await f())
  }
  console.log('sequencePromisesForAsync：', result)
  return result
}

const f1 = () => new Promise(resolve => {
  setTimeout(() => {
      console.log('f1')
      resolve('f1')
  }, 2000)
})
const f2 = () => new Promise(resolve => {
  setTimeout(() => {
      console.log('f2')
      resolve('f2')
  }, 1000)
})
const f3 = () => new Promise(resolve => {
  setTimeout(() => {
      console.log('f3')
      resolve('f3')
  }, 1000)
})