const counter = (state = 0, action : any) : any => {
  switch (action.type) {
    case 'DEMO/ADD_COUNTER':
      return state + (action.payload || 1)
    case 'DEMO/CLEAR_COUNTER':
      return action.payload
    default:
      return state
  }
}

export default counter