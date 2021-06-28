const userInfo = (state = {}, action : any) : any => {
  switch (action.type) {
    case 'SET_USER_INFO':
      return action.payload
    default:
      return state
  }
}

export default userInfo