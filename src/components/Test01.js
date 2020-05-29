import React, { Component } from 'react';
import {connect, callContract, call, getTransactionReceipt, sleep } from '../utils/antchain';
import { uint8arrayToString, uint8arrayToUint, uint8arrayToBool, uint8arrayToArray } from '../utils/uint8array';

const account = "lunsa";          //账号
const identity = "de09463f7d68c1c1a10dff7bc668c357822bdbf7bdc05aa39d96bad0b002b33c";
const kmsKeyId = "G4k7092tEFJVTTBO1590130829939";

const lunsa01 = "3314a64dfeb3b7acf74144644447b7da7c9742f3326123884c4347fc483bf3cd";
const lunsa02 = "0d6dfd15b5b370bdd61ca7f3a59acd2358fcc0ee975113b94dd414988ff14b6b";

const contractName = "test09";// "assert03";  //合约名称

const ASSERT_NAME_HASH = '18fc0bb562362a05f2e656faefd90cbae6de9873ee1d371421d82c61aab8dec0';
const ASSERT_SYMBOL_HASH = '1dc7a3b457b7327a646dec93c94a0736f49d5a32993b2a625abdb737f0d152f5';
const ASSERT_DECIMAL_HASH = 'c6bbd3a1da845bb8b70cfd9685afa4588a46db6426507832ce47d4cdda303e5d';
const ASSERT_TTLSUPPLY_HASH = 'bcaade8fd9ef5850f7b3f3232c45b3fd0da86649e3ca072e16d3cfb7340d879d';

class Test01 extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const token = await connect();
    this.setState({token});
    console.log('token', token);

    // await this.getAssertName();
    // await this.getAssertSymbol();
    // await this.getAssertDecimals();
    // await this.getTotalSupply();
    // await this.getBalanceOf(lunsa02);//lunsa01账户
    // await this.getMyBalance();
    // await this.transferTo(lunsa02, 1234567);//发送
    await this.test09();
  }

  async getAssertName() {
    // const data = await call(account, contractName, "name()", kmsKeyId, "[]", "[string]", this.state.token, 25000);
    // 每次读取合约中的数据要分两步，第一步：执行CALLCONTRACTBIZASYNC命令，获取Hash，需要消耗GAS，第二步：以第一步获取的Hash为参数，执行QUERYRECEIPT命令，不需要消耗GAS
    // 所以，对于那些静态数据调用，可以将Hash保存为常量，直接执行第二步
    const data = await getTransactionReceipt(ASSERT_NAME_HASH, this.state.token);
    console.log("name", uint8arrayToString(data));
  }

  async getAssertSymbol() {
    // const data = await call(account, contractName, "symbol()", kmsKeyId, "[]", "[string]", this.state.token, 25000);
    const data = await getTransactionReceipt(ASSERT_SYMBOL_HASH, this.state.token);
    console.log("symbol", uint8arrayToString(data));
  }

  async getAssertDecimals() {
    // const data = await call(account, contractName, "decimals()", kmsKeyId, "[]", "[uint256]", this.state.token, 25000);
    const data = await getTransactionReceipt(ASSERT_DECIMAL_HASH, this.state.token);
    // 如果用getTransactionReceipt，数值直接用 data
    console.log("decimals", uint8arrayToUint(data));    
  }

  async getTotalSupply() {
    // const data = await call(account, contractName, "totalSupply()", kmsKeyId, "[]", "[uint256]", this.state.token, 25000);
    const data = await getTransactionReceipt(ASSERT_TTLSUPPLY_HASH, this.state.token);
    // 如果用call，数据必须是data属性，即data.data
    console.log("totalSupply", uint8arrayToUint(data));
  }

  async getBalanceOf(acct) {
    const params = [
      {account: acct},
      30000
    ];
    const getParams = [
      {account: acct}
    ];
    // const data = await call(account, contractName, "balanceOf(identity)", kmsKeyId, JSON.stringify(getParams), "[uint256]", this.state.token, 30000);
    const data = await getTransactionReceipt("3ded6389a9c363b54182a8f20cc11b57c284a8ba69f2bb38029a1422974ca33b", this.state.token);

    // await call(account, contractName, "set(identity,uint256)", kmsKeyId, JSON.stringify(params), "[bool]", this.state.token, 60000);
    // await sleep(5000);
    // const data = await call(account, contractName, "get(identity)", kmsKeyId, JSON.stringify(getParams), "[uint256]", this.state.token, 30000);
    // 问题******：无法获取数据，原因是identity参数无法传给合约
    console.log("testing", data.data);
  }

  async getMyBalance() {
    const data = await call(account, contractName, "balanceOfMe()", kmsKeyId, "[]", "[uint256]", this.state.token, 30000);
    console.log("myBalance", uint8arrayToUint(data.data));
  }

  async transferTo(to, amount) {
    const params = [
      {account: to},
      amount
    ];
    const data = await call(account, contractName, "transfer(identity,uint256)", kmsKeyId, JSON.stringify(params), "[bool]", this.state.token, 70000);
    // 问题******：10201错误，Asset: transfer to the zero identity
    console.log(data.data);
  }

  async test08() {
    let data;
    //identity的参数必须要这么写，放在数组里，按照次序一个一个写，最后转成JSON传给合约
    const params = [
      {account: identity},
      "1005"
    ];
    data = await call(account, contractName, "set(identity,string)", kmsKeyId, JSON.stringify(params), "[bool]", this.state.token, 200000);
    await sleep(4000);
    data = await call(account, contractName, "getArray()", kmsKeyId, "", "[\"string[]\"]", this.state.token, 30000);
    //返回合约数组只支持uint256, string, identity
    //不支持返回struct
    
    console.log('data', data.data);
  }

  async test09() {
    let data;
    const params = [
      {account: lunsa02},
      "1003"
    ];
    const getParams = [
      {account: lunsa02}
    ]
    data = await call(account, contractName, "set(identity,string)", kmsKeyId, JSON.stringify(params), "[bool]", this.state.token, 80000);
    await sleep(4000);
    data = await call(account, contractName, "get(identity)", kmsKeyId, JSON.stringify(getParams), "[string]", this.state.token, 25000);
    
    console.log('data', uint8arrayToString(data.data));
  }

  async test10() {
    let data;
    const params = [
      {account: identity},
      8888
    ];
    const getParams = [
      {account: identity}
    ]
    data = await call(account, contractName, "set(identity,uint256)", kmsKeyId, JSON.stringify(params), "[bool]", this.state.token, 80000);
    await sleep(4000);
    data = await call(account, contractName, "get(identity)", kmsKeyId, JSON.stringify(getParams), "[uint256]", this.state.token, 25000);
    
    console.log('data', uint8arrayToUint(data.data));
  }
  render() {
    return (
      <div>

      </div>
    )
  }
}
export default Test01;