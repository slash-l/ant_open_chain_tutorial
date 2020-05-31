/**
 * Transfer from uint8array to certain data
 * By Guqianfeng, Ver.0.10.0
 * @2020-05-28
 */

const NodeRSA = require('node-rsa');
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

export const callContract = async (account, contractName, methodSignature, kmsKeyId, inputParamListStr, outParamListStr, token, gas) => {
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
      method:"CALLCONTRACTBIZASYNC",
      accessId,
      gas,
      tenantId
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

export const createAccount = async (account, kmsKeyId, token) => {
  const orderId = account + "_" + (new Date()).getTime() + parseInt(Math.random() * 10000);
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
 * 将发送交易与通过Hash获取交易信息整合在一起
 */
export const call = async (account, contractName, methodSignature, kmsKeyId, inputParamListStr, outParamListStr, token, gas) => {
  const d = await callContract(account, contractName, methodSignature, kmsKeyId, inputParamListStr, outParamListStr, token, gas);
  console.log("hash", d.data);
  await sleep(2500);
  const data = await getTransactionReceipt(d.data, token);
  return {
    hash: d.data,
    orderId: d.orderId,
    data
  }
}