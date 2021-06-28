import { useEffect } from "react"
import { useHistory } from 'react-router'
import { connect } from 'react-redux'

import logo from '@/assets/svg/logo.svg';
import './index.css';
import './index.scss';
import styles from './index.module.css';
import { getCommonCurrentUser } from '@/api'

function App(props : any) {
  const { userInfo, counter, dispatch } = props
  const REACT_APP_AUTHOR = process.env.REACT_APP_AUTHOR
  const history = useHistory()

  useEffect(() => {
    getCommonCurrentUser({}).then((res : any) => {
      const { success, data, info } = res
      if (success) {
        dispatch({
          type: 'SET_USER_INFO',
          payload: data
        })
        return
      }
      console.log(info)
    })
  }, [])

  const ckAddCounter = (num : Number) => {
    dispatch({
      type: 'DEMO/ADD_COUNTER',
      payload: num
    })
  }
  const ckClearCounter = () => {
    dispatch({
      type: 'DEMO/CLEAR_COUNTER',
      payload: 0
    })
  }
  return (
    <div className="rtt_index"
      style={
        {color: process.env.REACT_APP_MAIN_COLOR}
    }>
      <header className="index_header">
        <img
          src={logo}
          className="App-logo"
          alt="logo"
          onClick={() => history.push('./dashboard')}
        />
        <p onClick={() => history.push('./about')}>
          您好，{userInfo.name}{userInfo.sex === 1 ? '先生' : '女士'}!<br/>欢迎使用 react-ts-template 模板!
        </p>
        <p className="index_scss_color">
          有问题请反馈至{REACT_APP_AUTHOR}
        </p>
        <p>{counter}</p>
        <p>
          <span className={styles.index_module_button} onClick={() => ckAddCounter(counter || 1)}>单击</span>
          <span className={styles.index_module_button + ' ' + styles.active} onClick={() => ckClearCounter()}>清空</span>
        </p>
      </header>
    </div>
  );
}

export default connect((state : any) => ({
  userInfo: state.userInfo,
  counter: state.counter
}))(App)
