/**
 * Transfer from uint8array to certain data
 * By Guqianfeng, Ver.0.10.0
 * @2020-05-28
 */

const NodeRSA = require('node-rsa');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const url = "https://rest.baas.alipay.com/api/contract/chainCallForBiz";
const shakeHandUrl = "https://rest.baas.alipay.com/api/contract/shakeHand";

const accessId = process.env.REACT_APP_ACCESS_ID;
const tenantId = process.env.REACT_APP_TENANT_ID;
const chainId = process.env.REACT_APP_CHAIN_ID;

const sign = (message) => {
  const private_key = process.env.REACT_APP_PRIVATE_KEY_FILE;
  const key = new NodeRSA();
  key.setOptions({b: 2048, signingScheme: "pkcs1-sha256"});
  key.importKey(private_key, 'pkcs8-private');
  let buffer = Buffer.from(message);
  let signature = key.sign(buffer).toString('hex');
  return signature;
}

export const connect = async() => {
  const time = new Date().getTime();
  const message = accessId + time;
  const secret = sign(message);

  const body = {
    accessId,
    time,
    secret
  };

  const res = await fetch(shakeHandUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });

  const d = await res.json();
  return d.success ? d.data : false;
}

export const callContract = async (account, contractName, methodSignature, kmsKeyId, inputParamListStr, outParamListStr, token, gas, isLocalCall = false) => {
  const orderId = account + "_" + (new Date()).getTime() + parseInt(Math.random() * 10000);
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      orderId,
      bizid: chainId,
      account,
      contractName,
      methodSignature,
      mykmsKeyId: kmsKeyId,
      inputParamListStr,
      outTypes: outParamListStr,
      token,
      method: isLocalCall ? "CALLCONTRACTBIZ" : "CALLCONTRACTBIZASYNC",
      accessId,
      gas,
      tenantId,
      isLocalTransaction: isLocalCall
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
  const re = await res.json();
  re.orderId = orderId;
  return re;
}


/**
 * 创建托管账户
 */
export const createAccount = async (account, newAccountName, token) => {
  // 6月9日开放接口
  const orderId = account + "_" + (new Date()).getTime() + parseInt(Math.random() * 10000);
  const kmsKeyId = CryptoJS.SHA256(account).toString().substr(0, 8) + tenantId + (new Date()).getTime();
  console.log(kmsKeyId, accessId);
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      orderId,
      bizid: chainId,
      account,
      mykmsKeyId: kmsKeyId,
      token,
      method:"CREATEACCOUNT",
      accessId,
      tenantId
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
  const re = await res.json();
  re.orderId = orderId;
  console.log(re);
  return re;
}

export const getBlockHeight = async (token) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      bizid: chainId,
      token,
      method:"QUERYLASTBLOCK",
      accessId,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
  return await res.json();
}

export const getAccount = async (account, token) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      bizid: chainId,
      requestStr: `{"queryAccount":"${account}"}`,
      token,
      method:"QUERYACCOUNT",
      accessId,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
  return await res.json();
}

export const getTransaction = async(hash, token) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      bizid: chainId,
      hash,
      token,
      method:"QUERYTRANSACTION",
      accessId,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
  return await res.json();
}

export const getTransactionReceipt = async(hash, token) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      bizid: chainId,
      hash,
      token,
      method:"QUERYRECEIPT",
      accessId,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
  const query = await res.json();
  console.log(query.data);
  const queryData = JSON.parse(query.data);
  return(showData(queryData.output));
}

export const showData = (output) => {
  var b = new Buffer(output, 'base64')
  return(b);
}

export const sleep = async (ms) => {
  return new Promise(resolve=>{
      setTimeout(resolve,ms)
  })
}

/**
 * 数据上链以及从链上读取数据
 * 分成两种模式：
 * 如果是上链（改变链的状态）需要消耗GAS，且分为两步，第一步发送交易，第二步获取回执。默认 isLocalCall = false
 * 如果是读取链上数据，无需消耗GAS，以localCall方式读取。设置 isLocalCall = true
 */
export const call = async (account, contractName, methodSignature, kmsKeyId, inputParamListStr, outParamListStr, token, gas, isLocalCall = false) => {
  if(isLocalCall) {
    //LocalCall 不需要发送交易，无需改变链上状态
    let t = outParamListStr.substring(1, outParamListStr.length - 1);
    let outArray = t.split(",");
    for(let i = 0; i < outArray.length; i++) outArray[i] = outArray[i].replace("[]","");
    let d = await callContract(account, contractName, methodSignature, kmsKeyId, inputParamListStr, JSON.stringify(outArray), token, gas, isLocalCall);
    const data = showData(JSON.parse(d.data).transaction.data.transactionReceipt.output);
    return {
      hash: null,
      orderId: d.orderId,
      data
    }
  } else {
    // 改变链上状态的交易
    const d = await callContract(account, contractName, methodSignature, kmsKeyId, inputParamListStr, outParamListStr, token, gas, isLocalCall);
    console.log("hash", d.data);
    await sleep(2500);
    const data = await getTransactionReceipt(d.data, token);
    return {
      hash: d.data,
      orderId: d.orderId,
      data
    }
  }
}


/**
 * 根据账户名，返回账户地址identity
 * 如账户名为：lunsa，则返回: de09463f7d68c1c1a10dff7bc668c357822bdbf7bdc05aa39d96bad0b002b33c
 * @param {*} account 
 */
export const accountToIdentityString = (account) => {
  const identity = CryptoJS.SHA256(account);
  return identity.toString();
}

/**
 * 根据账户名，返回identity对象，该对象用于向链上发送地址
 * 如账户名为：lunsa，则返回：{data: "3glGP31owcGhDf97xmjDV4Ir2/e9wFqjnZa60LACszw=", empty: false, value: "3glGP31owcGhDf97xmjDV4Ir2/e9wFqjnZa60LACszw="}
 * @param {*} account 
 */
export const accountToIdentityObject = (account) => {
  const identity = CryptoJS.SHA256(account);
  const data = identity.toString(CryptoJS.enc.Base64);
  return {
    data,
    empty: false,
    value: data
  }
}