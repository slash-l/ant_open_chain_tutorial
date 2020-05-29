#### 本教程需具备技术基础：
* 较熟悉`Solidity`智能合约
* 熟悉`Javascript`
* 了解区块链基础知识

### 一、目标
创建一个资产管理区块链应用

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

contract UserManage {
    struct User {
        identity id;
        string name;
        uint256 age;
    }
    mapping (identity => User) private userMap;
    identity[] users;

    function get(identity addr) public view returns(identity, string, uint256) {
        return (userMap[addr].id, userMap[addr].name, userMap[addr].age);
    }

    function set(identity addr, string _name, uint256 _age) public returns(bool) {
        users.push(addr);
        User storage user = userMap[addr];
        user.id = addr;
        user.name = _name;
        user.age = _age;
        return true;
    }
}

```

#### 3、`UserManage.sol`编译与合约调试

### 四、前端应用开发

#### 1、握手

#### 2、数据上链
合约：`UserManange.sol`

方法：`setUser()`

#### 3、链上读取数据
合约：`UserManange.sol`

方法：
* getIdentities()：获取`identity`数组
* getNames()：获取`string`数组
* getAges()：获取`uint`数组
* getUser()：获取复合型返回数值
* getUsersArray()：获取带数组的复合型返回数值

#### 4、`http`调用组件解析
* antchain.js
* uint8array.js

#### 5、前端UI

#### 6、用户体验调试
