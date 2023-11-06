import { registerMicroApps, start } from 'qiankun'
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

registerMicroApps([
  {
    name: 'childVueApp',
    entry: '//localhost:9921/',
    container: '#childVueApp',
    activeRule: '/child-vue-app',
  },
  {
    name: 'childReactApp',
    entry: '//localhost:9922/',
    container: '#childReactApp',
    activeRule: '/child-react-app',
  },
])
start()

createApp(App).mount('#app')
