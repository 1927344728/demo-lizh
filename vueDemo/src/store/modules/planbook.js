const extend = {
  state: {
    categorySort: "",
    commonData: {},
    displayFormatSort: "",
    personData: {},
    productGroupList: [],
    theme: "",
    title: "",
    companyId: null
  },
  mutations: {
    INIT_PLANBOOK (state, data) {
      if (data.initData && data.initData.inputData) {
        let inputData = data.initData.inputData
        state.categorySort = inputData.categorySort
        state.commonData = inputData.commonData
        state.displayFormatSort = inputData.displayFormatSort
        state.personData = inputData.personData
        state.productGroupList = inputData.productGroupList
        state.theme = inputData.theme
      }
      state.title = data.title
      state.companyId = data.companyId
    }
  },
  actions: {
  }
}

export default extend