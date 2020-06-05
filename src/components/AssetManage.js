import React, { Component } from 'react';
import {connect, callContract, call, getTransactionReceipt, sleep, accountToIdentityObject } from '../utils/antchain';
import { uint8arrayToString, uint8arrayToUint, uint8arrayToBool, uint8arrayToArray } from '../utils/uint8array';

const account = process.env.REACT_APP_ACCOUNT;          //账号
const kmsKeyId = process.env.REACT_APP_KMSKEYID;

const contractName = "assetmanage01";  //合约名称

const ASSERT_NAME_HASH = 'fcd5d5dc3a9f9082a42c08ee73537437d7f7a589207bc71c0d9f54bc8eda13af';
const ASSERT_SYMBOL_HASH = 'b5ca56ad7f33e8f4032ba633ee29a82efbce49eba28478f153404891a370dd52';
const ASSERT_DECIMAL_HASH = '49a4ca800caea50d14888901ef46391f833aea7014c310bdb630589e605b20e6';
const ASSERT_TTLSUPPLY_HASH = '899672a088698b10d077cf8837307b1a63aafe3b283d9870db5267e3ce5bf5e1';

class AssetManage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const token = await connect();
    this.setState({token});
    console.log('token', token);

    // 获取基本参数
    // await this.getAssertName();
    // await this.getAssertSymbol();
    // await this.getAssertDecimals();
    // await this.getTotalSupply();

    // await this.getMyBalance();
    // await this.transferTo("lunsa01", 30);//发送
    // await sleep(3000);
    // await this.getBalanceOf("lunsa");//lunsa01账户
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
      accountToIdentityObject(acct)
    ];
    const data = await call(account, contractName, "balanceOf(identity)", kmsKeyId, JSON.stringify(params), "[uint256]", this.state.token, 30000);
    console.log("balanceOf " + acct, uint8arrayToUint(data.data));
  }

  async getMyBalance() {
    const data = await call(account, contractName, "balanceOfMe()", kmsKeyId, "[]", "[uint256]", this.state.token, 30000);
    console.log("myBalance", uint8arrayToUint(data.data));
  }

  async transferTo(to, amount) {
    const params = [
      accountToIdentityObject(to),
      amount
    ];
    const data = await call(account, contractName, "transfer(identity,uint256)", kmsKeyId, JSON.stringify(params), "[bool]", this.state.token, 70000);
    console.log(uint8arrayToBool(data.data));
  }

  render() {
    return (
      <div>

      </div>
    )
  }
}
export default AssetManage;