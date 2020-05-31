import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
// import Test01 from './components/Test01';
// import Test02 from './components/Test02';
import UserManage from './components/UserManage';

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/" exact component={UserManage}/>
        {/* <Route path="/test01" component={Test01}/> */}
        <Route path="/UserManage" component={UserManage}/>
      </Router>
    </div>
  );
}

export default App;
