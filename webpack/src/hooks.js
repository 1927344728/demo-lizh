const { SyncHook } = require('tapable')

const tHook = new SyncHook(['name', 'greeting'])
tHook.tap('func1', (name, greeting) => {
  console.log(`func1：${name}，${greeting}。`)
})

tHook.call('Lizhao', '你好！')