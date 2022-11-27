const NOOP = function () {}
const setAttribute = (dom, attr, value) => {
  if (/on\w+/.test(attr)) {
    attr = attr.toLowerCase()
    dom[attr] = value || NOOP
    return
  }
  dom.setAttribute(attr, value)
}

const updateClassComponent = (component) => {
  const {
    props,
    state,
    base,
    shouldComponentUpdate = NOOP,
    componentWillReceiveProps = NOOP,
    componentWillUpdate = NOOP,
    componentWillMount = NOOP,
    componentDidUpdate = NOOP,
    componentDidMount = NOOP
  } = component
  const isUpdateComponent = !!base
  if (isUpdateComponent) {
    const bool = shouldComponentUpdate(props, state)
    if (!bool && bool !== undefined) {
      return false
    }
    componentWillReceiveProps()
    componentWillUpdate()
  } else {
    componentWillMount()
  }

  const element = component.render()
  const hostDom = createHostDom(element)
  if (isUpdateComponent) {
    base.parentNode && base.parentNode.replaceChild(hostDom, base)
    componentDidUpdate()
  } else {
    componentDidMount()
  }
  component.base = hostDom
}

const createHostDom = (element) => {
  if (['string', 'number'].includes(typeof element)) {
    return document.createTextNode(element)
  }

  if (Object.getPrototypeOf(element.tag) === React.Component) {
    const component = new element.tag(element.attrs)
    updateClassComponent(component)
    return component.base
  }
  
  if (['string'].includes(typeof element.tag)) {
    const hostDom = document.createElement(element.tag)
    if (element.attrs) {
      for (let key in element.attrs) {
        setAttribute(hostDom, key, element.attrs[key])
      }
    }
    if (element.childs) {
      element.childs.forEach(child => {
        hostDom.appendChild(createHostDom(child))
      })
    }
    return hostDom
  }
}

const ReactDOM = {
  render: (element, root) => {
    root.innerText = ""
    root.appendChild(createHostDom(element))
  },
  updateClassComponent
}
window.ReactDOM = ReactDOM