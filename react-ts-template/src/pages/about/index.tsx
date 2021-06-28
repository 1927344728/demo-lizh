import { connect } from 'react-redux'
import './index.css'

function About(props : any) : any {
  const { userInfo } = props
  return <div className="rtt_about">
    您好，我是{userInfo.name}!
  </div>
}
export default connect((state : any) => ({
  userInfo: state.userInfo
}))(About)