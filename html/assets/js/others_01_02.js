class MyIndexedDB {
  constructor() {
    this.DB = null
    this.create()
    return new Promise(resolve => {
      this.create().then(event => {
        resolve(this)
      })
    })
  }
  create() {
    return new Promise((resolve, reject) => {
      const REQ = window.indexedDB.open('myIndexedDB', 1)
      REQ.onerror = event => {
        reject(event)
        throw event.target.error
      }
      // 下面事情执行于：数据库首次创建版本，或者window.indexedDB.open传递的新版本（版本数值要比现在的高）
      // onupgradeneeded 执行早于 onsuccess
      REQ.onupgradeneeded = event => {
        let tempDB = event.target.result
        if (!tempDB.objectStoreNames.contains('myIDB1')) {
          const oStore = tempDB.createObjectStore('myIDB1', {
            keyPath: 'id',
            autoIncrement: true
          })
          oStore.createIndex('id', 'id', { unique: true })
          oStore.createIndex('name', 'name')
          oStore.createIndex('email', 'email')
        }
      }
      REQ.onsuccess = event => {
        this.DB = event.target.result
        resolve(event)
      }
    })
  }

  add() {
    let oStore = this.DB.transaction(['myIDB1'], 'readwrite').objectStore('myIDB1')
    oStore.add({ id: 1, name: '张三', email: 'zhangsan@example.com' })
    oStore.add({ id: 2, name: '李四', email: 'lisi@example.com' })
  
    oStore.onsuccess = event => console.log('数据写入成功！')
    oStore.onerror = event => console.log('数据写入失败！')
  }

  read(id) { 
    let oStore = this.DB.transaction(['myIDB1'], 'readwrite').objectStore('myIDB1').get(id)
    oStore.onerror = event => console.log('事务失败！')
    oStore.onsuccess = event => {
      let result = event.target.result
      if (result) {
        console.log(`Name: ${result.name}`, `Email: ${result.email}`)
        return
      }
      console.log('未获得数据记录！')
    }
  }

  remove(id) {
    let oStore = this.DB.transaction(['myIDB1'], 'readwrite').objectStore('myIDB1').delete(id)
    oStore.onerror = event => console.log('删除失败！')
    oStore.onsuccess = event => console.log('删除成功！')
  }

  put(record) {
    let oStore = this.DB.transaction(['myIDB1'], 'readwrite').objectStore('myIDB1')
    oStore.put(record)
    oStore.onsuccess = event => console.log('数据更新成功！')
    oStore.onerror = event => console.log('数据更新失败！')
  }

  readAll() {
    let oStore = this.DB.transaction(['myIDB1'], 'readwrite').objectStore('myIDB1')
    oStore.openCursor().onsuccess = event => {
      let result = event.target.result
      if (result) {
        console.log(`Name: ${result.value.name}`, `Email: ${result.value.email}`)
        result.continue()
        return
      }
      console.log('没有更多数据了！')
    }
  }
}