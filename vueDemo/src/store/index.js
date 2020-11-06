import Vue from 'vue'
import Vuex from 'vuex'
import Extend from './modules/extend.js'
import Planbook from './modules/planbook.js'
import Popup from './modules/popup.js'
import Getters from './getters.js'
Vue.use(Vuex)

const store = new Vuex.Store({
	getters: Getters,
	modules: {
		Extend,
		Planbook,
		Popup
	}
})

export default store