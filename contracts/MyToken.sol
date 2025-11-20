// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyToken {
    string public name = "Test Token";
    string public symbol = "TT";
    uint8 public decimals = 18;
    uint public totalSupply;

    mapping(address => uint) public balanceOf;

    constructor(uint _supply) {
        totalSupply = _supply * 1e18;
        balanceOf[msg.sender] = totalSupply;
    }

    // GASLESS TRANSFER – NO FEES
    function transfer(address to, uint amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Not enough tokens");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;

        return true;
    }

    // Free mint
    function mint(address to, uint amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
}
