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

    function getById(identity addr) public view returns(identity, string, uint32) {
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
        return(users, "helloWorld", names, ages, ages.length);
    }

    function clean() public returns(bool) {
        delete users;
        delete ages;
        delete names;
        return true;
    }
}