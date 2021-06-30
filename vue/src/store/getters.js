import Vue from 'vue'
import Vuex from 'vuex'
import Extend from './modules/extend.js'
import Planbook from './modules/planbook.js'
import Popup from './modules/popup.js'
Vue.use(Vuex)

const getters = {
  PlanbookData (state) {
  	return state.Planbook
  },
  ExtendData (state) {
  	return state.Extend
  },
  PopupData (state) {
  	return state.Popup
  }
}

export default getters