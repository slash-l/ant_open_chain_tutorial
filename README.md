#### 本教程需具备技术基础：
* 较熟悉`Solidity`智能合约
* 熟悉`Javascript`
* 了解前端应用开发，如：React
* 了解区块链基础知识

源码与教程：

### 一、目标
#### 1、创建一个数据上链与链上读取数据的区块链应用

#### 2、Demo演示

#### 3、在区块链浏览器上查询交易

### 二、开发前准备
#### 1、帮助文档
https://tech.antfin.com/docs/2/145456

#### 2、登录蚂蚁金服控制台-开放联盟链
https://openchain.cloud.alipay.com

#### 3、添加链账户

#### 4、为链账户分配燃料

#### 5、开发时需要的参数：
* 证书accessId
* 证书私钥
* 链账户名
* 链账户地址
* 链账户kmsKeyId
* 链Id：a00e36c5
* 智能合约名（稍后）

### 三、开始智能合约开发
#### 1、蚂蚁智能合约与以太坊区别

#### 2、`UserManage.sol`合约编码
```
pragma solidity ^0.4.23;
pragma experimental ABIEncoderV2;

contract UserManage {
    struct User {
        identity id;
        string name;
        uint32 age;
    }
    mapping (identity => User) private userMap;
    identity[] private users;
    string[] private names;
    uint32[] private ages;

    function get() public view returns(identity, string, uint32) {
        identity addr = msg.sender;
        return (userMap[addr].id, userMap[addr].name, userMap[addr].age);
    }

    function set(string _name, uint32 _age) public returns(bool) {
        identity addr = msg.sender;
        users.push(addr);
        names.push(_name);
        ages.push(_age);
        
        User storage user = userMap[addr];
        user.id = addr;
        user.name = _name;
        user.age = _age;
        return true;
    }

    function getIdentities() public view returns(identity[]) {
        return users;
    }

    function getNames() public view returns(string[]) {
        return names;
    }

    function getAges() public view returns(uint32[]) {
        return ages;
    }

    function getUsers() public view returns(identity[], string, string[], uint32[], uint256) {
        return(users, "helloWorld", names, ages, names.length);
    }

    function clean() public returns(bool) {
        delete users;
        delete ages;
        delete names;
        return true;
    }
}

```

#### 3、`UserManage.sol`编译与合约调试

#### 4、合约升级

### 四、前端应用开发
#### 1、教程源码下载
#### 2、源码安装
```
npm install 
```

* 配置.env
```
cp .env_example .env
```
编辑`.env`文件

* 运行
```
yarn start
```

#### 3、源码解析
##### 握手

##### 数据上链
方法：`setUser()`

##### 链上读取数据
合约：`UserManange.sol`

方法：
* getIdentities()：获取`identity`数组
* getNames()：获取`string`数组
* getAges()：获取`uint`数组
* getUser()：获取复合型返回数值
* getUsersArray()：获取带数组的复合型返回数值

##### `http`调用组件解析
* antchain.js
* uint8array.js

