/**
 * Transfer from uint8array to certain data
 * By Guqianfeng, Ver.0.10.0
 * @2020-05-28
 */

/**
 * Get single string data from smart contract
 * @param {*} data 
 */
const CryptoJS = require('crypto-js');

export const uint8arrayToString = (data) => {
  var i = 0;
  var d = [];
  for(i = 32; i < 64; i++) d.push(data[i]);
  const strLen = uint8arrayToUint(d);
  d = [];
  for(i = 64; i < 64 + strLen; i++) d.push(data[i]);
  const decode = new TextDecoder("utf-8");
  const str = decode.decode(new Uint8Array(d));
  return str;
}

const getStringStart = (data, start) => {
  var i = 0;
  var d = [];
  for(i = start; i < 32 + start; i++) d.push(data[i]);
  const strLen = uint8arrayToUint(d);
  
  d = [];
  for(i = 32 + start; i < 32 + start + strLen; i++) d.push(data[i]);
  const decode = new TextDecoder("utf-8");
  const str = decode.decode(new Uint8Array(d));
  return str;
}

/**
 * Get single uint(uint256, uint32...) data from smart contract
 * @param {*} data 
 */
export const uint8arrayToUint = (data) => {
  var length = data.length;
  if(length !== 32) return false;
  let buffer = Buffer.from(data);
  var result = buffer.readUIntBE(0, length);

  return result;
}

/**
 * Get single Boolean type data from smart contract
 * @param {*} data 
 */
export const uint8arrayToBool = (data) => {
  var b = uint8arrayToUint(data);
  return b === 1;
}

/**
 * Get single identity type data from smart contract
 * @param {*} data 
 */
export const uint8arrayToIdentity = (data) => {
  if(data.length !== 32) return false;
  var output = "";
  for(var i = 0; i < data.length; i++) {
    output = output + (data[i]>15 ? data[i].toString(16) : '0' + data[i].toString(16));
  }
  return output;
}

/**
 * Get array data from smart contract
 * Supported data type: identity[], string[], uint[], bool[]
 * ex: Smart Contract returns(identity[]), type = "identity"
 * ex: Smart Contract returns(string[]), type = "string"
 * 
 * @param {*} data 
 * @param {*} type 
 */
export const uint8arrayToArray = (data, type) => {
  const header = getArrayHeader(data);
  const l = header.bytes;
  const size = header.size;

  var re = [];
  var i,j = 0;
  var d = [];
  if(type === "string") {
    // For String Object
    var strLen = [];
    for(i = 2; i < 2 + size; i++) {
      d = [];
      for(j = i * 32; j <= (i + 1) * 32 - 1; j++) d.push(data[j]);
      strLen.push(uint8arrayToUint(d) + 64);
    }
    strLen.push(data.length);
    for(i = 0; i < strLen.length - 1; i++) {
      d = [];
      for(j = strLen[i]; j <= strLen[i + 1] - 1; j++) d.push(data[j]);
      re.push(getStringStart(d, 0));
    }
  } else {
    // For Non-String object
    for(i = 2; i < 2 + size; i++) {
      d = [];
      for(j = i * l; j <= (i + 1) * l - 1; j++) d.push(data[j]);
      if(type.substring(0, 4) === "uint") re.push(uint8arrayToUint(d));
      else if(type === "bool") re.push(uint8arrayToBool(d));
      else if(type === "identity") re.push(uint8arrayToIdentity(d));
    }
  }
  return re;
}

const getArrayHeader = (data) => {
  // Standard array data structure
  // 获取返回数组前64个字节
  // 前32个字节是每个数据的长度
  // 后32个字节是数组元素个数
  var bytesArray = [];
  var sizeArray = [];
  for(var i = 0; i < 32; i++) {
    bytesArray.push(data[i]);
    sizeArray.push(data[i+32]);
  }
  const bytes = uint8arrayToUint(bytesArray);
  const size = uint8arrayToUint(sizeArray);
  return {bytes, size};
}

/**
 * Get combined data from smart contract
 * Supported data type: identity, uint, string, bool, identity[], uint[], string[], bool[]
 * 
 * ex: Smart Contract returns(identity,string,uint256), types="[identity,string,uint256]"
 * ex: Smart Contract returns(identity[],string[],uint256[]), types="[identity[],string[],uint32[]]"
 * ex: Smart Contract returns(identity[], uint256), types="identity[],uint256"
 * 
 * @param {*} data 
 * @param {*} types 
 */
export const uint8arrayToCombinedData = (data, types) => {
  const t = types.substring(1, types.length - 1);
  types = t.split(",");

  var d, e = [];
  var re = [];
  var i, j = 0;
  var start = 0;
  for(i = 0; i < types.length; i++) {
    d = [];
    //Add 32 bytes to be 64 bytes before real data, to let the data as standard array. 
    e = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 32];
    for(j = i * 32; j <= (i + 1) * 32 - 1; j++) d.push(data[j]);
    if(types[i] === "string") {
      re.push(getStringStart(data, uint8arrayToUint(d)));
    } else if(types[i].substring(0, 4) === "uint" && types[i].substr(-2, 2) !== "[]") {
      re.push(uint8arrayToUint(d));
    } else if(types[i] === "bool") {
      re.push(uint8arrayToBool(d));
    } else if(types[i] === "identity") {
      re.push(uint8arrayToIdentity(d));
    } else if(types[i] === "string[]") {
      start = uint8arrayToUint(d);
      for(j = start; j < data.length; j++) e.push(data[j]);
      re.push(uint8arrayToArray(e, "string"));
    } else if(types[i].substring(0, 4) === "uint" && types[i].substr(-2, 2) === "[]") {
      start = uint8arrayToUint(d);
      for(j = start; j < data.length; j++) e.push(data[j]);
      re.push(uint8arrayToArray(e, "uint"));
    } else if(types[i] === "bool[]") {
      start = uint8arrayToUint(d);
      for(j = start; j < data.length; j++) e.push(data[j]);
      re.push(uint8arrayToArray(e, "bool"));
    } else if(types[i] === "identity[]") {
      start = uint8arrayToUint(d);
      for(j = start; j < data.length; j++) e.push(data[j]);
      re.push(uint8arrayToArray(e, "identity"));
    }
  }
  return re;
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