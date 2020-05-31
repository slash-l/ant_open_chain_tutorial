/**
 * Transfer from uint8array to certain data
 * By Guqianfeng, Ver.0.10.0
 * @2020-05-28
 */

import React, { Component } from 'react';
import {connect, callContract, call, getTransactionReceipt, sleep } from '../utils/antchain';
import { uint8arrayToString, uint8arrayToUint, uint8arrayToBool, uint8arrayToArray, uint8arrayToIdentity, uint8arrayToCombinedData } from '../utils/uint8array';
import { Button, Input, Table, Popconfirm, Modal } from 'antd';
import "./UserManage.css";

const account = "lunsa";          //账号
const identity = "de09463f7d68c1c1a10dff7bc668c357822bdbf7bdc05aa39d96bad0b002b33c";
const kmsKeyId = "G4k7092tEFJVTTBO1590130829939";

const contractName = "usermanage01";  //合约名称

class UserManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      setUserSuccess: false,
      previousQueryTx: '',
      previoutSaveTx: '',
      tableData: []
    }
  }

  columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '上链Hash',
      dataIndex: 'tx',
      key: 'tx',
      render: (text, record) => 
        <Popconfirm title="是否查看上链记录?" onConfirm={() => this.openTxUrl(text, record)}>
          <a>{this.formatIdentity(record.tx)}</a>
        </Popconfirm>      
    }
  ];
  

  openTxUrl = (t, r) => {
    console.log(r.tx);
  }

  formatIdentity = (identity) => {
    return identity.substr(0, 4) + "..." + identity.substr(-4, 4);
  }
  componentDidMount = async() => {
    const token = await connect();
    this.setState({token});
    console.log('token', token);

    // await this.getUser();
    // await this.getIdentities();
    // await this.getNames();
    // await this.getAges();
    await this.getUsersArray(true);
    // await this.cleanArray();
  }

  setUser = async () => {
    if(this.state.name === undefined || this.state.name === '' || this.state.age === undefined || this.state.age === '') {alert("请输入正确内容"); return;};
    const params = [
      this.state.name,            //Name
      parseInt(this.state.age)    //Age
    ];
    const data = await call(account, contractName, "set(string,uint32)", kmsKeyId, JSON.stringify(params), "[bool]", this.state.token, 2000000);
    const re = uint8arrayToBool(data.data);
    this.setState({
      modalVisible: true,
      setUserSuccess: re,
      previoutSaveTx: data.hash
    });
    if(re) {
      // 将上链的数据，以及返回的 data.orderId, data.hash 保存到服务器数据库
    }
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

  getUsersArray = async (newTx) => {
    // 获取所有数据
    const respTypes = "[identity[],string,string[],uint32[],uint256]";
    let data;
    if(newTx) {
      // 方法一：完整调用
      data = await call(account, contractName, "getUsers()", kmsKeyId, "[]", respTypes, this.state.token, 80000);
      data = data.data;
      this.setState({
        previousQueryTx: data.hash
      })
    } else {
      // 方法二：节约GAS调用
      if(this.state.previousQueryTx !== '') data = await getTransactionReceipt(this.state.previousQueryTx, this.state.token);
      else {alert("建议调用合约时需要设置最新的Tx Hash")};
    }
    const dataArray = uint8arrayToCombinedData(data, respTypes);
    // console.log(dataArray);
    this.rendTable(dataArray);
  }

  rendTable = async(data) => {
    const size = data[0].length;
    let tableData = [];
    for(let i = 0; i < size; i++) {
      let d = {
        key: i + 1,
        name: data[2][i],
        age: data[3][i],
        tx: data[0][i]
      }
      tableData.push(d);
    }
    this.setState({tableData});
  }

  cleanArray = async () => {
    const data = await call(account, contractName, "clean()", kmsKeyId, "[]", "[bool]", this.state.token, 1500000);
    console.log('clean', uint8arrayToBool(data.data));
  }

  onChangeHander = (e, type) => {
    if(type === 1) this.setState({name:e.target.value});
    else if(type === 2) this.setState({age:e.target.value});
  }

  modalHandleOk = async () => {
    this.setState({modalVisible:false});
    await this.getUsersArray(true);
  }
  modalHandleCancel = () => {
    this.setState({modalVisible:false});
  }
  render() {
    return (
      <div>
        <div className="title">
          Ant Openchain Turorial<br/>
          Lesson #1
        </div>
        <div className="write-chain">
          <Input className="input-line" size="large" placeholder="Name" value={this.state.name} onChange={(e) => this.onChangeHander(e, 1)}/>
          <Input className="input-line" size="large" placeholder="Age" value={this.state.age} onChange={(e) => this.onChangeHander(e, 2)}/>
          <Button className="input-line" type="primary" size="large" block onClick={this.setUser}>数据上链</Button>
        </div>
        <div className="read-chain">
          <Table columns={this.columns} dataSource={this.state.tableData} />
        </div>
        <Modal
          title={this.state.setUserSuccess ? "上链成功，Tx: " + this.state.previoutSaveTx + ", 是否刷新列表?" : "上链失败"}
          visible={this.state.modalVisible}
          onOk={this.modalHandleOk}
          onCancel={this.modalHandleCancel}
        ></Modal>
      </div>
    )
  }
}

export default UserManage;