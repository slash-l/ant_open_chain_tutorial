import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import AssetManage from './components/AssetManage';
// import Test02 from './components/Test02';
import UserManage from './components/UserManage';

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/" exact component={AssetManage} />
        <Route path="/assetmanage" component={AssetManage}/>
        <Route path="/usermanage" component={UserManage}/>
      </Router>
    </div>
  );
}

export default App;
