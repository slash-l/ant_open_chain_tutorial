pragma solidity ^0.4.23;

/**
 * @title SafeMath
 * @dev 安全的 uint256 数学基本计算
 */
library SafeMath {
    /**
     * @dev 乘法，若有溢出则revert
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev 除法，除0时 revert
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, "SafeMath: division by zero");
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev 减法
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev 加法
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev 求余数，除数为0时 revert
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0, "SafeMath: modulo by zero");
        return a % b;
    }
}

/*
* 资产合约，实现了Asset基本的接口，可被合约市场的 "资产管理合约(AssetManager)" 进行管理。
*/
contract AssetManager {
    using SafeMath for uint256;

    identity admin; // 合约管理员角色

    mapping (identity => uint256) private _balances;

    mapping (identity => mapping (identity => uint256)) private _allowances;

    /**
    * @dev 资产发行总量
    */
    uint256 private _totalSupply;

    /**
    * @dev 资产名称
    */
    string private _name;

    /**
    * @dev 资产符号
    */
    string private _symbol;

    /**
    * @dev 资产金额小数位数，因为合约只支持整形，用此数值来表示小数，默认为2
    */
    uint256 private _decimals = 2;

    event Issue(identity to, uint256 value);

    event Transfer(identity from, identity to, uint256 value);

    event Approval(identity owner, identity spender, uint256 value);


    /**
    * @dev 权限控制，管理员角色
    */
    modifier onlyAdmin() {
        require(msg.sender == admin, "Permission denied");
        _;
    }

    /**
    * @dev 初始化合约方法
    */
    constructor() public {
        admin = msg.sender;
    }
    /**
     * @dev 已发行的资产总数
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev 获取目标账户identity的余额
     * @param owner 目标查询账户的 identity
     * @return 目标账户的额度
     */
    function balanceOf(identity owner) public view returns (uint256) {
        return _balances[owner];
    }

    function balanceOfMe() public view returns (uint256) {
        return _balances[msg.sender];
    }

    function name() public view returns(string) {
        return _name;
    }

    function symbol() public view returns(string) {
        return _symbol;
    }

    function decimals() public view returns(uint256) {
        return _decimals;
    }
    /**
     * @dev 检查资产的拥有者授权给使用者的资产额度
     * @param owner 拥有资产的账户 identity
     * @param spender 授予权限使用资产的账户 identity
     * @return 授予权限可使用的资产额度
     */
    function allowance(identity owner, identity spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev 从提交交易的账户，转移资产到一个目标账户
     * @param to 转移资产的目标账户 identity
     * @param value 转移资产的额度
     */
    function transfer(identity to, uint256 value) public returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev 授权给一个目标账户来使用指定额度的资产
     * @param spender 被授权的账户 identity
     * @param value 被授权可使用的资产额度值
     */
    function approve(identity spender, uint256 value) public returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev 转移资产从一个账户到另一个账户
     * @param from 资产转出的账户 identity
     * @param to 目标转入的账户 identity
     * @param value 资产转移的额度
     */
    function transferFrom(identity from, identity to, uint256 value) public returns (bool) {
        _transfer(from, to, value);
        _approve(from, msg.sender, _allowances[from][msg.sender].sub(value));
        return true;
    }

    /*
    * @dev 发行资产的方法，只有管理员有权限操作
    */
    function issue(identity account, string assert_name, string assert_symbol, uint256 assert_decimals, uint256 value) onlyAdmin() public returns (bool) {
        _totalSupply = value;
        _name = assert_name;
        _symbol = assert_symbol;
        _decimals = assert_decimals;
        _balances[account] = value;
        emit Issue(account, value);
        return true;
    }

    function mint(identity account, uint256 value) onlyAdmin() public returns(bool) {
        _totalSupply = _totalSupply.add(value);
        _balances[account] = _balances[account].add(value);
        emit Issue(account, value);
        return true;
    }

    /**
     * @dev 内部方法，给一个目标账户 identity 转移资产
     * @param from 转出资产的账户 identity
     * @param to 转入资产的目标账户 identity
     * @param value 转移资产的数额
     */
    function _transfer(identity from, identity to, uint256 value) internal {
        require(from != identity(0), "Asset: transfer from the zero identity");
        require(to != identity(0), "Asset: transfer to the zero identity");

        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }

    /**
     * @dev 允许一个账户来使用另外一个账户的资产
     * @param owner 拥有资产的identity
     * @param spender 使用资产的identity
     * @param value 能够使用的资产数额
     */
    function _approve(identity owner, identity spender, uint256 value) internal {
        require(owner != identity(0), "Asset: approve from the zero identity");
        require(spender != identity(0), "Asset: approve to the zero identity");

        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    mapping(identity => uint256) private data;
    function set(identity addr, uint256 d) public returns (bool) {
        _balances[addr] = d;
        return true;
    }
    function get(identity addr) public view returns (uint256) {
        return _balances[addr];
    }
}