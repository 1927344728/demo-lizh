import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

import Index from '@/pages/index/index.js'

console.log("Index")
function App() {
  return <BrowserRouter>
    <Switch>
      <Route path={'/'}>
        <Index />
      </Route>
    </Switch>
  </BrowserRouter>
}

export default App