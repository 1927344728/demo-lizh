import {
  getCommonCurrentUser
} from '@/api'
export default {
  state: {
    userInfo: null
  },
  mutations: {
    SET_USER_INFO: (state : any, payload : any) : void => {
      state.userInfo = payload
    }
  },
  actions: {
    setUserInfo: (state : any) : void => {
      getCommonCurrentUser().then((res : any) => {
        if (res.success && res.data) {
          state.commit('SET_USER_INFO', res.data)
        }
      })
    }
  }
}
