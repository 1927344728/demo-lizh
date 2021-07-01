export default {
  state: {
    userInfo: null
  },
  mutations: {
    SET_USER_INFO: (state, payload) => {
      state.userInfo = payload
    }
  },
  actions: {
    setUserInfo: (state, payload) => {
      state.commit('SET_USER_INFO', payload)
    }
  }
}