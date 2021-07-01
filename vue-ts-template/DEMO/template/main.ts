import Vue from 'vue'
import App from './app.vue'
import Mixinx from '@/mixins'
import store from '@/store/index'

Vue.config.productionTip = false

Vue.mixin(Mixinx)
new Vue({
  store,
  render: h => h(App)
}).$mount('#app')