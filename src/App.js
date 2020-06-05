import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import AssetManage from './components/AssetManage';
import CreateAccount from './components/CreateAccount';
import UserManage from './components/UserManage';

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/" exact component={UserManage} />
        <Route path="/assetmanage" component={AssetManage}/>
        <Route path="/usermanage" component={UserManage}/>
      </Router>
    </div>
  );
}

export default App;
