import { combineReducers } from 'redux'
import userInfo from './reducers/user_info'
import counter from './reducers/counter'

const Reducers = combineReducers({
  userInfo,
  counter,
})

export default Reducers