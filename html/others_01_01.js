class MyWebSql {
  constructor () {
    this.DB = openDatabase('myDB', '1.0', '测试数据库', 2 * 1024 * 1024, d => {
      console.log('创建成功！')
    })
  }
  exec (statement, argus = [], callback = function (SQLTransaction, results){}) {
    /* transaction执行数据库操作，操作内容就是正常的数据库的增删改查 */
    this.DB.transaction(tx => {
      // executeSql是执行具体的sql。sql语句, [变量1, 变量2], 执行后的回调)
      // 基本操作与实际数据库操作基本一致。
      tx.executeSql(statement, argus, callback )
    })    
  }
 tCreate () {
    this.exec('CREATE TABLE IF NOT EXISTS myTable1 (id unique, desc)')
  }
 tInsert () {
    this.exec('INSERT INTO myTable1 (id, desc) VALUES (1, "第1条记录")');
    this.exec('INSERT INTO myTable1 (id, desc) VALUES (?, ?)', [2, '第2条记录']);
    this.exec('INSERT INTO myTable1 (id, desc) VALUES (?, ?)', [3, '第3条记录']);
    this.exec('INSERT INTO myTable1 (id, desc) VALUES (?, ?)', [4, '第4条记录']);
  }
 tSelect () {
    this.exec('SELECT * FROM myTable1', [], (SQLTransaction, results) => {
      const len = results.rows.length
      for (let i = 0; i < len; i++) {
        console.log(results.rows.item(i).desc)
      }
      console.log(`查询记录条数: ${len}`)
    }, null)
  }
 tUpdate () {
    this.exec('UPDATE myTable1 SET desc="更新第3条记录" WHERE id=3')
    this.exec('UPDATE myTable1 SET desc="更新第4条记录" WHERE id=?', [4])
  }
 tDelete () {
    this.exec('DELETE FROM myTable1 WHERE id=1')
    this.exec('DELETE FROM myTable1 WHERE id=?', [2])
  }
 tDrop () {
    this.exec('DROP TABLE myTable1')
  }
}