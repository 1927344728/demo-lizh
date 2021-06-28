import { useEffect, useState } from "react"
import { useHistory } from 'react-router'
import { connect } from 'react-redux'

import './index.css'
import {
  getCommonCurrentUser,
  getSalesQaList,
  getSalesQaObjectionList
} from '@/api'

function Home(props : any) : any {
  const { dispatch } = props
  const history = useHistory()
  const [bannerList, setBannerList] = useState([])
  const [objectionList, setObjectionList] = useState([])
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
  useEffect(() => {
    getSalesQaList({}).then((res : any) => {
      setBannerList(res.data)
    })
    getSalesQaObjectionList({}).then((res : any) => {
      setObjectionList(res.data)
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
  return <div className="ts_index">
    {
      bannerList && !!bannerList.length && 
      <>
        <ul className="ts_index_banner">
          {
            bannerList && bannerList.map((b : any) => <li key={b.id} onClick={() => {
              history.push('./dashboard')
            }}>
            <img
              src={b.sceneImg}
              alt={b.sceneName}
            />
            <div className="title">
              <h3>{b.sceneName}</h3>
              <p>模拟聊天场景，为您联系新客户助力</p>
            </div>
            <i className="iconfont icon-forward"></i>
          </li>)
          }
        </ul>
        <h3 className="ts_index_track" onClick={() => {
          history.push('./Track')
        }}>
          <img
            src="https://media.winbaoxian.com/autoUpload/common/ffe94374-6b14-4af4-bf0d-6c15b56e8568.png"
            alt="客户沟通轨迹"
          />
          <div className="title">客户沟通轨迹</div>
          <div className="icon">
            <i className="iconfont icon-forward"></i>
          </div>
          <span className="look_over">有更新待查看</span>
        </h3>
      </>
    }
    {
      objectionList && !!objectionList.length && 
      <dl className="ts_index_objection">
        <dt>
          <h3>
            <span>异议处理素材库</span>
            <span className="more" onClick={() => ckClearCounter()}>更多素材 <i className="iconfont icon-forward"></i></span>
          </h3>
          <p>教您应对各种刁钻问题</p>
        </dt>
        {
          objectionList.map((o : any) => <dd key={o.id}>
            <img src="https://media.winbaoxian.com/autoUpload/common/9be46dad-95e3-4f24-b36b-7b7c5c5dda60.png" alt="异议ICON" />
            <div className="content">{o.question}</div>
            <span className="view" onClick={() => ckAddCounter(2)}>查看回答</span>
          </dd>
          )
        }
      </dl>
    }
  </div>
}

export default connect((state : any) => {
  return {
    userInfo: state.userInfo,
    counter: state.counter
  }
}, dispatch => {
  return {
    dispatch
  }
}
)(Home)