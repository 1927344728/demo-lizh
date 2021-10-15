
function createWebDB() {
  const DB = openDatabase('myDB', '1.0', '测试数据库', 2 * 1024 * 1024, d => {
    console.log('创建成功！')
  })

  /* transaction执行数据库操作，操作内容就是正常的数据库的增删改查 */
  DB.transaction(tx => {
    // executeSql是执行具体的sql。sql语句, [变量1, 变量2], 执行后的回调)
    // 基本操作与实际数据库操作基本一致。
    tx.executeSql('CREATE TABLE IF NOT EXISTS myTable1 (id unique, desc)');
    tx.executeSql('INSERT INTO myTable1 (id, desc) VALUES (1, "第1条记录")');
    tx.executeSql('INSERT INTO myTable1 (id, desc) VALUES (?, ?)', [2, '第2条记录']);
    tx.executeSql('INSERT INTO myTable1 (id, desc) VALUES (?, ?)', [3, '第3条记录']);
    tx.executeSql('INSERT INTO myTable1 (id, desc) VALUES (?, ?)', [4, '第4条记录']);
    tx.executeSql('SELECT * FROM myTable1', [], (SQLTransaction, results) => {
      const len = results.rows.length
      for (let i = 0; i < len; i++) {
        console.log(results.rows.item(i).desc)
      }
      console.log(`查询记录条数: ${len}`)
    }, null)
  })
  DB.transaction(tx => {
    tx.executeSql('DELETE FROM myTable1 WHERE id=1')
    tx.executeSql('DELETE FROM myTable1 WHERE id=?', [2])
    tx.executeSql('UPDATE myTable1 SET desc="更新第3条记录" WHERE id=3')
    tx.executeSql('UPDATE myTable1 SET desc="更新第4条记录" WHERE id=?', [4])
    tx.executeSql('DROP TABLE myTable1')
  })
}

function createIndexedDB() {
  let db
  const REQ = window.indexedDB.open('myIndexedDB', 1)
  REQ.onerror = event => { }
  REQ.onsuccess = event => {
    db = REQ.result
    add(db)
    read(db)
  }
  // 下面事情执行于：数据库首次创建版本，或者window.indexedDB.open传递的新版本（版本数值要比现在的高）
  REQ.onupgradeneeded = event => {
    let tempDB = event.target.result
    if (!tempDB.objectStoreNames.contains('myIDB1')) {
      const objectStore = tempDB.createObjectStore('myIDB1', {
        keyPath: 'id',
        autoIncrement: true
      })
      objectStore.createIndex('id', 'id', { unique: true })
      objectStore.createIndex('name', 'name')
      objectStore.createIndex('email', 'email')
    }
  }
}

function add(DB) {
  let tempReq = DB.transaction(['myIDB1'], 'readwrite').objectStore('myIDB1')
  tempReq.add({ id: 1, name: '张三', email: 'zhangsan@example.com' })
  tempReq.add({ id: 2, name: '李四', email: 'lisi@example.com' })

  tempReq.onsuccess = event => console.log('数据写入成功！')
  tempReq.onerror = event => console.log('数据写入失败！')
}
function read(DB) {
  let tempReq = DB.transaction(['myIDB1'], 'readwrite')
    .objectStore('myIDB1')
    .get(1)

  tempReq.onerror = event => console.log('事务失败！')
  tempReq.onsuccess = event => {
    if (tempReq.result) {
      console.log(`Name: ${tempReq.result.name}`, `Email: ${tempReq.result.email}`)
      return
    }
    console.log('未获得数据记录！')
  };
}
function put(DB) {
  let tempReq = DB.transaction(['myIDB1'], 'readwrite').objectStore('myIDB1')
  tempReq.put({ id: 1, name: '张三（更新）', email: 'zhangsan@example.com（更新）' })

  tempReq.onsuccess = event => console.log('数据更新成功！')
  tempReq.onerror = event => console.log('数据更新失败！')
}
function remove(DB, id) {
  let tempReq = DB.transaction(['myIDB1'], 'readwrite')
    .objectStore('myIDB1')
    .delete(id)

  tempReq.onerror = event => console.log('删除失败！')
  tempReq.onsuccess = event => console.log('删除成功！')
}
function readAll(DB) {
  let tempReq = DB.transaction(['myIDB1'], 'readwrite').objectStore('myIDB1')
  tempReq.openCursor().onsuccess = event => {
    let cursor = event.target.result
    if (cursor) {
      console.log(`Name: ${cursor.value.name}`, `Email: ${cursor.value.email}`)
      cursor.continue()
      return
    }
    console.log('没有更多数据了！')
  }
}