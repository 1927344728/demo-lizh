import Vuex from 'vuex'
import common from './modules/common.js'
import getters from './getters.js'
Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    common
  },
  getters
})