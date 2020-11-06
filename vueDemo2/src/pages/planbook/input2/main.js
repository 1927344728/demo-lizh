import Vue from 'vue'
import App from './index.vue'
Vue.config.productionTip = false
import MyMixin from '@/mixins/index.js'

Vue.mixin(MyMixin)
new Vue({
  render: h => h(App)
}).$mount('#app')