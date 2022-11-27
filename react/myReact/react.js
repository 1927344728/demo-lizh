const createElement = (tag, attrs, ...childs) => {
  return { tag, attrs, childs }
}

function Component(props) {
  this.props = props
  this.state = {}
}
Component.prototype.setState = function (updateState) {
  this.state = Object.assign({}, this.state, updateState)
  ReactDOM.updateClassComponent(this)
}

const React = {
  createElement,
  Component
}
window.React = React