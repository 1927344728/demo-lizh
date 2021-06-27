import { useEffect, useState } from "react"

import './index.css'
import {
  getSalesQaTracePage
} from '@/api'
import {
  parseTime
} from '@/utils'

export default function About() {
  const [trackData, setTrackData] = useState({
    data: null,
    page: 0,
    pageSize: 20
  })
  useEffect(() => {
    getSalesQaTracePage({
      clientName: null,
      page: trackData.page,
      pageSize: trackData.pageSize
    }).then(res => {
      setTrackData({
        ...trackData,
        data: res.data,
        page: ++ trackData.page
      })
    })
  }, [])
  return <div className="ts_track">
    <div className="track_list">
      {
        !!trackData.data && !!trackData.data.entityList && !!trackData.data.entityList.length && 
        trackData.data.entityList.map(t => <dl key={t.id} className="track_content">
          <dt>
            <h4>{t.sceneName}</h4>
            <p>更新时间：{parseTime(t.lastSendTime, '{y}-{m}-{d} {hh}:{mm}')}</p>
          </dt>
          <dd>
            <div className="avatar">
              <img src={t.headImg} alt="头像" />
            </div>
            <div className="name">
              <h4>{t.clientName}</h4>
              {
                t.nickName && 
                <p>微信：{t.nickName}</p>
              }
            </div>
            <div className="questionnaire">
              {
                !!t.trace && !!t.trace.length && 
                t.trace.map(c => <p key={c.step}>{c.step === 1 ? '需求调查' : c.step === 2 ? '背景调查' : '保险定制方案'}</p>)
              }
            </div>
            <div className="status">
              {
                !!t.trace && !!t.trace.length &&
                t.trace.map(c => <p key={c.step} className={`status_${c.status}`} >{c.status === 1 ? '已发送' : c.status === 2 ? '已反馈' : '未发送'}</p>)
              }
            </div>
          </dd>
        </dl>)
      }
    </div>
  </div>
}