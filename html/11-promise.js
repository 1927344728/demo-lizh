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
  let pushValue = recordValue.bind(null, [])
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
  let pushValue = recordValue.bind(null, [])
  return promises.reduce((promise, task) => {
    return promise.then(task).then(pushValue)
  }, Promise.resolve())
}

async function sequencePromisesForAsync(promises) {
  let result
  for (let f of promises) {
    result = await f(result)
  }
  console.log('sequencePromisesForAsync：', result)
  return result
}

const func1 = () => new Promise(resolve => {
  setTimeout(() => {
    console.log('func1')
    resolve('func1')
  }, 2000)
})
const func2 = () => new Promise(resolve => {
  setTimeout(() => {
    console.log('func2')
    resolve('func2')
  }, 1000)
})
const func3 = () => new Promise(resolve => {
  setTimeout(() => {
    console.log('func3')
    resolve('func3')
  }, 1000)
})