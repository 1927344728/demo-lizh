import React, { Component, useEffect, useState } from "react"
import { useHistory } from 'react-router'
import { connect } from 'react-redux'

import './index.css';


function FuncComponent (props : any) {
  useEffect(() => {
    setTimeout(() => {
      alert('function:' + props.name)
    }, 2000)
  }, [])
  return <div>
    Hello, {props.name}!
    <br />
    <button onClick={() => props.updateName('Lizhao')}>Function</button>
  </div>
}
class ClassComponent extends Component <any> {
  constructor (props : any) {
    super(props)
  }
  componentDidMount () {
    setTimeout(() => {
      alert('class:' + this.props.name)
    }, 3000)
  }
  render () {
    return <div>
      Hello, {this.props.name}! 
      <br />
      <button onClick={() => this.props.updateName('Lizhao')}>Class</button>
    </div>
  }
}


function Test(props : any) {
  const statusss = useState('World')
  debugger
  const [name, setName] = statusss
  const updateName = (n : any) => {
    setName(n)
  }
  debugger
  console.log(name)
  return <div className='test_container'>
    <div className="test_body">
      <FuncComponent name={name} updateName={updateName} />
      <ClassComponent name={name} updateName={updateName} />
    </div>
  </div>
}

export default connect((state : any) => ({
  userInfo: state.userInfo,
  counter: state.counter
}))(Test)
