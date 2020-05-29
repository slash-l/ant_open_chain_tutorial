import React, { Component } from 'react';
import {connect, callContract, call, getTransactionReceipt, sleep } from '../utils/antchain';
import { uint8arrayToString, uint8arrayToUint, uint8arrayToBool, uint8arrayToArray, uint8arrayToIdentity, uint8arrayToCombinedData } from '../utils/uint8array';

const account = "lunsa";          //账号
const identity = "de09463f7d68c1c1a10dff7bc668c357822bdbf7bdc05aa39d96bad0b002b33c";
const kmsKeyId = "G4k7092tEFJVTTBO1590130829939";

const contractName = "usermanage01";  //合约名称

class UserManage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = async() => {
    const token = await connect();
    this.setState({token});
    console.log('token', token);

    // await this.setUser();
    // await sleep(40000);

    // await this.getUser();
    // await this.getIdentities();
    // await this.getNames();
    // await this.getAges();
    await this.getUsersArray();
    // await this.cleanArray();
  }

  setUser = async () => {
    const params = [
      '伦萨科技01',
      2
    ];
    const data = await call(account, contractName, "set(string,uint32)", kmsKeyId, JSON.stringify(params), "[bool]", this.state.token, 2000000);
    console.log('setUser', uint8arrayToBool(data.data));
  }

  getNames = async () => {
    // 获取返回数组（字符串）
    const data = await call(account, contractName, "getNames()", kmsKeyId, "[]", "[string]", this.state.token, 40000);
    console.log('getNames', uint8arrayToArray(data.data, 'string'));
  }

  getIdentities = async () => {
    // 获取返回数组（地址）
    const data = await call(account, contractName, "getIdentities()", kmsKeyId, "[]", "[identity]", this.state.token, 40000);
    console.log('getIdentities', uint8arrayToArray(data.data, 'identity'));
  }

  getAges = async () => {
    // 获取返回数组（uint）
    const data = await call(account, contractName, "getAges()", kmsKeyId, "[]", "[uint]", this.state.token, 40000);
    console.log('getAges', uint8arrayToArray(data.data, 'uint'));
  }

  getUser = async () => {
    const respTypes = "[identity,string,uint32]"; //返回参数列表，必须要与合约返回一样
    const data = await call(account, contractName, "get()", kmsKeyId, "[]", respTypes, this.state.token, 40000);
    console.log('getUser', uint8arrayToCombinedData(data.data, respTypes));
  }

  getUsersArray = async () => {
    // 获取所有数据
    const respTypes = "[identity[],string,string[],uint32[],uint256]";
    const data = await call(account, contractName, "getUsers()", kmsKeyId, "[]", respTypes, this.state.token, 80000);
    console.log('getUsers', uint8arrayToCombinedData(data.data, respTypes));
  }

  cleanArray = async () => {
    const data = await call(account, contractName, "clean()", kmsKeyId, "[]", "[bool]", this.state.token, 1500000);
    console.log('clean', uint8arrayToBool(data.data));
  }

  render() {
    return (
      <div>

      </div>
    )
  }
}

export default UserManage;