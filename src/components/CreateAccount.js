import React, { Component } from 'react';
import {connect, createAccount} from '../utils/antchain';

class CreateAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = async () => {
    console.log("CreateAccount");
    const token = await connect();
    this.setState({token});
    console.log('token', token);
    createAccount('lunsa', 'lunsa05', token);
  }

  render() {
    return (
      <div>

      </div>
    )
  }
}
export default CreateAccount;