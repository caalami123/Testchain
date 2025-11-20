// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestToken {
    string public name = "TestToken";
    string public symbol = "TT";
    uint8 public decimals = 18;
    mapping(address => uint) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint amount);

    constructor() {
        // Initial mint to deployer (optionally leave 0)
    }

    function mint(address to, uint amount) public {
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint amount) public returns(bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
