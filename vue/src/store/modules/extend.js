const extend = {
  state: {
    interactInfo: null,
    saleStatus: null,
    userCompnayId: null,
    userSex: 1,
    verifyData: null,
    exportData: null,
    recordSetting: null
  },
  mutations: {
    INIT_EXTEND (state, data) {
      state.interactInfo = data.interactInfo
      state.saleStatus = data.saleStatus
      state.userCompnayId = data.userCompnayId
      state.userSex = data.userSex
      state.verifyData = data.verifyData
      state.exportData = data.exportData
      state.recordSetting = data.recordSetting
    }
  },
  actions: {
    create_extend (context) {
      context.commit('INIT_EXTEND')
    }
  }
}

export default extend