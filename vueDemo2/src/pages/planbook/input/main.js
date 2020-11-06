import Vue from 'vue'
import App from './index.vue'
import store from '@/store/index.js'
import PlatoValidator from 'plato-validator'

Vue.use(PlatoValidator)
Vue.config.productionTip = false

new Vue({
	store,
	render: h => h(App)
}).$mount('#app')
