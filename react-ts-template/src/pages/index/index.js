import { useEffect } from "react";
import {
  BrowserRouter as Router,
  // HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import Home from '../home'
import Track from '../track'
import Dashboard from '../dashboard'

import {
  initPageBasicConfig
} from '@/utils/index.ts'

function App () {
  useEffect(() => {
    initPageBasicConfig({
      pageWrapperDom: document.getElementById("root")
    })
  }, [])
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/track" component={Track} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </Router>
  )
}

export default App