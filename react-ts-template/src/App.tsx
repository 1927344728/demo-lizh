import { useEffect } from "react";
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router,
  // HashRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { createStore } from 'redux'

import Index from '@/pages/index'
import Track from '@/pages/track'
import Dashboard from '@/pages/dashboard'
import Reducers from '@/store'
import {
  initPageBasicConfig
} from '@/utils/index'

const store = createStore(Reducers)
function App() : any {
  useEffect(() => {
    initPageBasicConfig({
      statSDKPageId: window.location.origin,
      pageWrapperDom: document.getElementById("root")
    })
  }, [])
  return <Provider store={store}>
    <Router>
      <Switch>
        <Route exact path="/" component={Index} />
        <Route path="/track" component={Track} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </Router>
  </Provider>
}
export default App