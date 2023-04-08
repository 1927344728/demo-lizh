var array = [3, 44, 38, 5, 47, 15, 36, 26, 27, 2, 46, 4, 19, 50, 48]

function bubbleSort (arr) {
  const len = arr.length
  let temp
  for (let i = 0; i < len; i ++) {
    for (let j = 0; j < len - 1 - i; j ++) {
      if (arr[j] > arr[j + 1]) {
        temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
      }
      console.count()
    }
  }
  return arr
}

function bubbleSort2 (arr) {
  let i = arr.length - 1
  let position
  let temp
  while ( i > 0) {
    position = 0
    for (let j = 0; j < i; j ++) {
      if (arr[j] > arr[j+1]) {
        temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
        position = j
      }
      console.count()
    }
    i = position
  }
  return arr
}

function selectionSort (arr) {
  const len = arr.length
  let index
  let temp
  for (let i = 0; i < len - 1; i ++) {
    index = i
    for (let j = i + 1; j < len; j ++) {
      if (arr[j] < arr[index]) {
        index = j
      }
      console.count()
    }
    temp = arr[i]
    arr[i] = arr[index]
    arr[index] = temp
  }
  return arr
}

function insertionSort (arr) {
  const len = arr.length
  let temp
  let index
  for (let i = 1; i < len; i ++) {
    temp = arr[i]
    index = i
    while (index > 0 && arr[index - 1] > temp) {
      arr[index] = arr[index - 1]
      index --
      console.count()
    }
    arr[index] = temp
  }
  return arr
}
function insertionSort2 (arr) {
  let temp
  let left
  let right
  let middle
  for (let i = 1; i < arr.length; i ++) {
    temp = arr[i]
    left = 0
    right = i - 1
    while (left <= right) {
      middle = Math.floor((left + right) / 2)
      if (arr[middle] > temp) {
        right = middle - 1
      } else {
        left = middle + 1
      }
      console.count()
    }
    for (let j = i - 1; j >= left; j--) {
      arr[j + 1] = arr[j]
      console.count()
    }
    arr[left] = temp
  }
  return arr
}


function partition(arr, left, right) {
  const pivot = arr[Math.floor((right + left) / 2)]
  let i = left
  let j = right
  let temp
  while (i <= j) {
    while (arr[i] < pivot) {
      i ++
    }
    while (arr[j] > pivot) {
      j --
    }
    if (i <= j) {
      temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp
      i ++
      j --
    }
    console.log(arr)
  }
  return i
}
function quickSort(arr, left = 0, right = arr.length - 1) {
  const index  = partition(arr, left, right)
  if (left < index - 1) {
    quickSort(arr, left, index - 1)
  }
  if (index < right) {
    quickSort(arr, index, right)
  }
  return arr
}

function shellSort(arr) {
  const len = arr.length
  let gap = Math.floor(len / 2)
  let temp
  while(gap) {
    for(let i = gap; i < len; i ++) {
      for(let j = i - gap; j >= 0; j -= gap) {
        if(arr[j] > arr[j + gap]) {
          temp = arr[j]
          arr[j] = arr[j + gap]
          arr[j + gap] = temp
        }
      }
    }
    gap = Math.floor(gap / 2)
  }
  return arr
}

function mergeSort(arr) {
  const len = arr.length
  if(len < 2) {
    return arr
  }
  const middle = Math.floor(len / 2)
  const left = arr.slice(0, middle)
  const right = arr.slice(middle)
  return merge(mergeSort(left), mergeSort(right))
}

function merge(left, right) {
  const result = []
  while (left.length > 0 && right.length > 0) {
    if (left[0] <= right[0]) {
      result.push(left.shift())
    } else {
      result.push(right.shift())
    }
  }
  while (left.length) {
    result.push(left.shift())
  }
  while (right.length) {
    result.push(right.shift())
  }
  return result
}

function heapSort(arr){
  const len = arr.length
  const nonleaf = Math.floor(len / 2) - 1
  for(let i = nonleaf; i >= 0; i --){
    buildHeap(arr, i, len)
  }

  let temp
  for(let j = len - 1; j > 0; j --){
    temp = arr[0]
    arr[0] = arr[j]
    arr[j] = temp
    buildHeap(arr, 0, j)
  }
  return arr
}

function buildHeap(arr, i, len){
  const top = arr[i]
  const child = i * 2 + 1
  let index = i
  for(let k = child; k < len; k = k * 2 + 1){
    if( k + 1 < len && arr[k] < arr[k + 1]){
      k ++
    }
    if(arr[k] > top){
      arr[index] = arr[k]
      index = k
    }
  }
  arr[index] = top
}

function countSort(arr) {
  let min = arr[0]
  for (let k in arr) {
    min = arr[k] < min ? arr[k] : min
  }
  const count = []
  for (let num in arr) {
    if (!count[arr[num] - min]) {
      count[arr[num] - min] = 0
    }
    count[arr[num] - min] ++
  }

  let index = 0
  for (let i = 0; i < count.length; i ++) {
    while (count[i] && count[i] > 0) {
      arr[index] = i + min
      index ++
      count[i] --
    }
  }
  return arr
}

function bucketSort(arr, bucketSize) {
  let min = arr[0]
  let max = arr[0]
  for (let k in arr) {
    max = arr[k] > max ? arr[k] : max
    min = arr[k] < min ? arr[k] : min
  }

  const size = bucketSize || 5
  const count = Math.floor((max - min) / size) + 1
  const buckets = []
  for (let i = 0; i < count; i ++) {
    buckets[i] = []
  }

  for (let i = 0; i < arr.length; i ++) {
    buckets[Math.floor((arr[i] - min) / size)].push(arr[i])
  }

  arr.length = 0
  for (let i = 0; i < count; i ++) {
    insertionSort(buckets[i])
    for (let j = 0; j < buckets[i].length; j ++) {
      arr.push(buckets[i][j])
    }
  }
  return arr
}

function radixSort(arr) {
  let max = arr[0]
  for (let k in arr) {
    max = arr[k] > max ? arr[k] : max
  }
  const maxDigit = (max + '').length

  const counter = []
  let mod = 10
  let dev = 1
  for (let i = 0; i < maxDigit; i ++, mod *= 10, dev *= 10) {
    for(let j = 0; j < arr.length; j ++) {
      let bucket = Math.floor((arr[j] % mod) / dev)
      if(!counter[bucket]) {
        counter[bucket] = []
      }
      counter[bucket].push(arr[j])
    }
    let index = 0
    for(let j = 0; j < counter.length; j ++) {
      if(counter[j] && counter[j].length) {
        let value = counter[j].shift()
        while (value || value === 0) {
          arr[index] = value
          index ++
          value = counter[j].shift()
        }
      }
    }
  }
  return arr
}
